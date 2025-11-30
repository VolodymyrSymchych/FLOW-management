import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { authService } from '@/lib/auth-service';
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

    // Call auth-service to update locale
    const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/locale`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ locale }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Auth service locale update error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update locale' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Invalidate user cache after locale update
    await invalidateUserCache(session.userId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update locale error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update locale' },
      { status: 500 }
    );
  }
}
