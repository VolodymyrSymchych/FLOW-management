import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../../server/storage';
import { createSession } from '@/lib/auth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
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
        scope: 'openid email profile User.Read',
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

    // Try to get user info from Microsoft Graph API
    let userInfo: any = null;
    let userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      // Fallback to OpenID Connect userinfo endpoint
      console.warn('Microsoft Graph API failed, trying OpenID Connect userinfo endpoint');
      const errorText = await userInfoResponse.text();
      console.error('Microsoft Graph API error:', errorText);
      
      userInfoResponse = await fetch('https://graph.microsoft.com/oidc/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userInfoResponse.ok) {
        const fallbackError = await userInfoResponse.text();
        console.error('Microsoft OpenID Connect userinfo error:', fallbackError);
        return NextResponse.redirect(
          new URL('/sign-in?error=user_info_failed', BASE_URL)
        );
      }
    }

    userInfo = await userInfoResponse.json();
    const { id: providerId, mail, email, displayName: name, userPrincipalName } = userInfo;
    
    // Use mail, email (from OIDC), or userPrincipalName as email
    const userEmail = mail || email || userPrincipalName;

    if (!userEmail) {
      return NextResponse.redirect(
        new URL('/sign-in?error=no_email', BASE_URL)
      );
    }

    // Get user photo (optional)
    let picture: string | null = null;
    try {
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        // In production, you might want to upload this to your storage
        // For now, we'll skip storing the photo URL
      }
    } catch (e) {
      // Photo is optional, continue without it
    }

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
        // Create new user
        const username = userEmail.split('@')[0] + '_' + nanoid(6);
        user = await storage.createUser({
          email: userEmail,
          username,
          fullName: name || null,
          avatarUrl: picture || null,
          provider: 'microsoft',
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
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message || 'oauth_error')}`, BASE_URL)
    );
  }
}

