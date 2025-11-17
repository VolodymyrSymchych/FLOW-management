import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../../server/storage';
import { createSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

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

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Clear OAuth cookies
    const response = NextResponse.redirect(new URL(redirectTo, BASE_URL));
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_redirect');

    return response;
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message || 'oauth_error')}`, BASE_URL)
    );
  }
}

