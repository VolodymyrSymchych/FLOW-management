import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { createSession } from '@/lib/auth';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function POST(request: NextRequest) {
  try {
    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error('JWT_SECRET is not properly configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const rememberMe = body.rememberMe === true;

    // Call auth-service
    const result = await authService.login({
      emailOrUsername: body.emailOrUsername || body.email,
      password: body.password,
    });

    // Check for errors from auth-service
    if (result.error || !result.success) {
      console.error('Login failed:', {
        error: result.error,
        success: result.success,
        hasToken: !!result.token,
        hasUser: !!result.user,
      });

      const errorMessage = typeof result.error === 'string'
        ? result.error
        : (typeof result.error === 'object' && (result.error as any)?.message)
          ? (result.error as any).message
          : JSON.stringify(result.error) || 'Failed to login';

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }

    if (!result.token || !result.user) {
      console.error('Login response missing required fields:', {
        hasToken: !!result.token,
        hasUser: !!result.user,
        result: result,
      });

      return NextResponse.json(
        { error: 'Invalid response from auth service' },
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
      const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days or 1 hour

      cookieStore.set('auth_token', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
      });

      // Create local session token for compatibility with existing code
      await createSession({
        userId: payload.userId as number,
        email: payload.email as string,
        username: payload.username as string,
        fullName: result.user.fullName || null,
      }, rememberMe);
    } catch (error) {
      console.error('Error creating session:', error);
      // Still return success, but session might not be set
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
