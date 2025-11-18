import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { authService } from '@/lib/auth-service';
import { SignJWT, jwtVerify } from 'jose';
import { storage } from '../../../../../server/storage';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
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
      // Get full user data from database to include emailVerified
      try {
        const dbUser = await storage.getUser(session.userId);
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
        console.error('Error fetching user from database:', error);
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
      
      if (result.error || !result.user) {
        // Fallback to session data if auth-service fails
        // Get full user data from database to include emailVerified
        try {
          const dbUser = await storage.getUser(session.userId);
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
          console.error('Error fetching user from database:', error);
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

      return NextResponse.json({
        user: result.user,
      });
    } catch (error) {
      console.error('Error calling auth-service:', error);
      // Fallback to session data if auth-service fails
      // Get full user data from database to include emailVerified
      try {
        const dbUser = await storage.getUser(session.userId);
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
        console.error('Error fetching user from database:', dbError);
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
