import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../../server/storage';
import { createSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Normalize BASE_URL - remove trailing slash if present
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent('OAuth authentication failed')}`, BASE_URL)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/sign-in?error=missing_parameters', BASE_URL)
      );
    }

    // Verify state parameter
    const storedState = request.cookies.get('oauth_state')?.value;
    const redirectTo = request.cookies.get('oauth_redirect')?.value || '/';

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/sign-in?error=invalid_state', BASE_URL)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${BASE_URL}/api/auth/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token exchange error:', errorData);
      return NextResponse.redirect(
        new URL('/sign-in?error=token_exchange_failed', BASE_URL)
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL('/sign-in?error=user_info_failed', BASE_URL)
      );
    }

    const userInfo = await userInfoResponse.json();
    const { id: providerId, email, name, picture } = userInfo;

    if (!email) {
      return NextResponse.redirect(
        new URL('/sign-in?error=no_email', BASE_URL)
      );
    }

    // Check if user exists by provider
    let user = await storage.getUserByProvider('google', providerId);

    if (!user) {
      // Check if user exists by email (account linking)
      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        // Link OAuth account to existing user
        user = await storage.updateUser(existingUser.id, {
          provider: 'google',
          providerId,
          avatarUrl: picture || existingUser.avatarUrl,
          emailVerified: true,
        });
      } else {
        // User doesn't exist - redirect to sign-up with prefilled email
        const signUpUrl = new URL('/sign-up', BASE_URL);
        signUpUrl.searchParams.set('email', email);
        signUpUrl.searchParams.set('fullName', name || '');
        signUpUrl.searchParams.set('provider', 'google');
        signUpUrl.searchParams.set('providerId', providerId);
        if (picture) {
          signUpUrl.searchParams.set('avatarUrl', picture);
        }

        // Clear OAuth cookies before redirect
        const response = NextResponse.redirect(signUpUrl);
        response.cookies.delete('oauth_state');
        response.cookies.delete('oauth_redirect');
        response.cookies.delete('oauth_remember_me');

        return response;
      }
    } else {
      // Update user info
      user = await storage.updateUser(user.id, {
        avatarUrl: picture || user.avatarUrl,
        fullName: name || user.fullName,
        emailVerified: true,
      });
    }

    if (!user) {
      return NextResponse.redirect(
        new URL('/sign-in?error=user_creation_failed', BASE_URL)
      );
    }

    // Get JWT token from auth-service for this user
    // We need to create a token that auth-service can verify
    const { SignJWT, jwtVerify } = await import('jose');
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

    // Read rememberMe preference from cookie
    const rememberMe = request.cookies.get('oauth_remember_me')?.value === 'true';
    const expirationTime = rememberMe ? '7d' : '1h';
    const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days or 1 hour

    // Create auth-service compatible token
    const authToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .setIssuer('project-scope-analyzer')
      .sign(JWT_SECRET);

    // Create session with fullName
    await createSession({
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || null,
    }, rememberMe);

    // Clear OAuth cookies and set auth_token cookie
    const response = NextResponse.redirect(new URL(redirectTo, BASE_URL));
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_redirect');
    response.cookies.delete('oauth_remember_me');

    // Set auth_token cookie for auth-service API calls
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message || 'oauth_error')}`, BASE_URL)
    );
  }
}

