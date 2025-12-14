import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { authService } from '@/lib/auth-service';
import { SignJWT, jwtVerify } from 'jose';
import { storage } from '../../../../../server/storage';
import { getCachedUser } from '@/lib/user-cache';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[/api/auth/me] ========== START ==========');
  try {
    const session = await getSession();

    console.log('[/api/auth/me] Session:', session ? { userId: session.userId, email: session.email } : 'null');

    if (!session) {
      console.log('[/api/auth/me] No session, returning 401');
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get auth-service token from cookie (preferred) or fallback to session token
    const cookieStore = await import('next/headers').then(m => m.cookies());
    let token = cookieStore.get('auth_token')?.value;

    // If no auth_token, try to use session token (for backward compatibility)
    if (!token) {
      token = cookieStore.get('session')?.value;
    }

    if (!token) {
      // Fallback to session data if no token available
      // Get full user data from cache/database to include emailVerified
      try {
        const dbUser = await getCachedUser(session.userId);
        if (dbUser) {
          return NextResponse.json({
            user: {
              id: dbUser.id,
              email: dbUser.email,
              username: dbUser.username,
              fullName: dbUser.fullName || null,
              emailVerified: dbUser.emailVerified,
              role: dbUser.role,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching user from cache/database:', error);
      }

      // Final fallback to session data only
      return NextResponse.json({
        user: {
          id: session.userId,
          email: session.email,
          username: session.username,
          fullName: session.fullName || null,
          emailVerified: false, // Default to false if we can't get from DB
        },
      });
    }

    // Call auth-service to get user info
    try {
      const result = await authService.getMe(token);

      console.log('[/api/auth/me] Auth service result:', JSON.stringify(result, null, 2));

      if (result.error || !result.user) {
        console.log('[/api/auth/me] Auth service failed, using fallback');
        // Fallback to session data if auth-service fails
        // Get full user data from cache/database to include emailVerified
        try {
          const dbUser = await getCachedUser(session.userId);
          console.log('[/api/auth/me] DB user from cache:', JSON.stringify(dbUser, null, 2));
          if (dbUser) {
            return NextResponse.json({
              user: {
                id: dbUser.id,
                email: dbUser.email,
                username: dbUser.username,
                fullName: dbUser.fullName || null,
                emailVerified: dbUser.emailVerified,
                role: dbUser.role,
              },
            });
          }
        } catch (error) {
          console.error('Error fetching user from cache/database:', error);
        }

        // Final fallback to session data only
        return NextResponse.json({
          user: {
            id: session.userId,
            email: session.email,
            username: session.username,
            fullName: session.fullName || null,
            emailVerified: false, // Default to false if we can't get from DB
          },
        });
      }

      console.log('[/api/auth/me] Returning auth service user:', JSON.stringify(result.user, null, 2));
      return NextResponse.json({
        user: result.user,
      });
    } catch (error) {
      console.error('Error calling auth-service:', error);
      // Fallback to session data if auth-service fails
      // Get full user data from cache/database to include emailVerified
      try {
        const dbUser = await getCachedUser(session.userId);
        if (dbUser) {
          return NextResponse.json({
            user: {
              id: dbUser.id,
              email: dbUser.email,
              username: dbUser.username,
              fullName: dbUser.fullName || null,
              emailVerified: dbUser.emailVerified,
              role: dbUser.role,
            },
          });
        }
      } catch (dbError) {
        console.error('Error fetching user from cache/database:', dbError);
      }

      // Final fallback to session data only
      return NextResponse.json({
        user: {
          id: session.userId,
          email: session.email,
          username: session.username,
          fullName: session.fullName || null,
          emailVerified: false, // Default to false if we can't get from DB
        },
      });
    }
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}
