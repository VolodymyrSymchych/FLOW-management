import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { invalidateUserCache } from '@/lib/user-cache';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get auth token from cookie
    const cookieStore = await import('next/headers').then(m => m.cookies());
    let token = cookieStore.get('auth_token')?.value;

    // Fallback to session token
    if (!token) {
      token = cookieStore.get('session')?.value;
    }

    if (!token) {
      return NextResponse.json({ error: 'No auth token found' }, { status: 401 });
    }

    // Get locale from request body
    const body = await request.json();
    const { locale } = body;

    if (!locale || !['en', 'uk'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    // Call auth-service to update locale in database
    const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      await fetch(`${AUTH_SERVICE_URL}/api/auth/locale`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ locale }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    } catch (e) {
      console.warn('Backend locale update failed, proceeding with local cookie:', e);
    }

    // Invalidate user cache after locale update
    if (session?.userId) {
      await invalidateUserCache(session.userId);
    }

    // Set cookie in response (Essential for next-intl middleware)
    const response = NextResponse.json({ success: true, locale });
    response.cookies.set('NEXT_LOCALE', locale, { 
      path: '/', 
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    return response;
  } catch (error: any) {
    console.error('Update locale error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update locale' },
      { status: 500 }
    );
  }
}
