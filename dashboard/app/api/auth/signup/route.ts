import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { createSession } from '@/lib/auth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call auth-service
    const result = await authService.signup({
      email: body.email,
      username: body.username,
      password: body.password,
      name: body.name,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    if (!result.success || !result.token || !result.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Store the auth-service token in a separate cookie for API calls
    // Also create a local session token for compatibility
    try {
      const { payload } = await jwtVerify(result.token, JWT_SECRET);
      
      // Store auth-service token in cookie (for API calls to auth-service)
      const cookieStore = await import('next/headers').then(m => m.cookies());
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
      
      cookieStore.set('auth_token', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });
      
      // Create local session token for compatibility with existing code
      await createSession({
        userId: payload.userId as number,
        email: payload.email as string,
        username: payload.username as string,
        fullName: result.user.fullName || null,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      // Still return success, but session might not be set
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      verificationToken: (result as any).verificationToken,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
