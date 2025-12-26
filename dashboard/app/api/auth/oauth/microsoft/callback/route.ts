import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../../server/storage';
import { createSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
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
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: MICROSOFT_CLIENT_ID!,
        client_secret: MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${BASE_URL}/api/auth/oauth/microsoft/callback`,
        grant_type: 'authorization_code',
        scope: 'openid email profile',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Microsoft token exchange error:', errorData);
      return NextResponse.redirect(
        new URL('/sign-in?error=token_exchange_failed', BASE_URL)
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      console.error('Microsoft OAuth: No access token received');
      return NextResponse.redirect(
        new URL('/sign-in?error=no_access_token', BASE_URL)
      );
    }

    // Get user info from OpenID Connect userinfo endpoint (no User.Read permission needed)
    let userInfo: any = null;
    const userInfoResponse = await fetch('https://graph.microsoft.com/oidc/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('Microsoft OpenID Connect userinfo error:', errorText);
      return NextResponse.redirect(
        new URL('/sign-in?error=user_info_failed', BASE_URL)
      );
    }

    userInfo = await userInfoResponse.json();
    // OpenID Connect userinfo returns: sub, email, name, preferred_username, etc.
    const { sub: providerId, email, name, preferred_username } = userInfo;
    const userPrincipalName = preferred_username || email;

    // Use email from OpenID Connect userinfo
    const userEmail = email || userPrincipalName;

    if (!userEmail) {
      return NextResponse.redirect(
        new URL('/sign-in?error=no_email', BASE_URL)
      );
    }

    // Get user photo (optional) - Note: requires User.Read permission, so we skip it
    // to avoid triggering security notifications
    let picture: string | null = null;
    // Photo fetching disabled to minimize security notifications
    // If photo is needed, add User.Read permission back, but this will trigger emails
    // try {
    //   const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });
    //   if (photoResponse.ok) {
    //     const photoBlob = await photoResponse.blob();
    //     // In production, you might want to upload this to your storage
    //     // For now, we'll skip storing the photo URL
    //   }
    // } catch (e) {
    //   // Photo is optional, continue without it
    // }

    // Check if user exists by provider
    let user = await storage.getUserByProvider('microsoft', providerId);

    if (!user) {
      // Check if user exists by email (account linking)
      const existingUser = await storage.getUserByEmail(userEmail);

      if (existingUser) {
        // Link OAuth account to existing user
        user = await storage.updateUser(existingUser.id, {
          provider: 'microsoft',
          providerId,
          avatarUrl: picture || existingUser.avatarUrl,
          emailVerified: true,
        });
      } else {
        // User doesn't exist - redirect to sign-up with prefilled email
        const signUpUrl = new URL('/sign-up', BASE_URL);
        signUpUrl.searchParams.set('email', userEmail);
        signUpUrl.searchParams.set('fullName', name || '');
        signUpUrl.searchParams.set('provider', 'microsoft');
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
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message || 'oauth_error')}`, BASE_URL)
    );
  }
}

