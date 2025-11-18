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
        // Create new user
        const username = email.split('@')[0] + '_' + nanoid(6);
        user = await storage.createUser({
          email,
          username,
          fullName: name || null,
          avatarUrl: picture || null,
          provider: 'google',
          providerId,
          password: null, // No password for OAuth users
          emailVerified: true,
          isActive: true,
          role: 'user',
        });
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
    
    // Create auth-service compatible token
    const authToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setIssuer('project-scope-analyzer')
      .sign(JWT_SECRET);

    // Create session with fullName
    await createSession({
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || null,
    });

    // Clear OAuth cookies and set auth_token cookie
    const response = NextResponse.redirect(new URL(redirectTo, BASE_URL));
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_redirect');
    
    // Set auth_token cookie for auth-service API calls
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
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

