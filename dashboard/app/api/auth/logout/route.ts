import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { authService } from '@/lib/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get auth-service token from cookie
    const cookieStore = await cookies();
    let token = cookieStore.get('auth_token')?.value;
    
    // Fallback to session token if auth_token not available
    if (!token) {
      token = cookieStore.get('session')?.value;
    }

    // Call auth-service logout if token exists
    if (token) {
      try {
        await authService.logout(token);
      } catch (error) {
        console.error('Error calling auth-service logout:', error);
        // Continue with local logout even if auth-service fails
      }
    }

    // Delete local session and auth token
    await deleteSession();
    cookieStore.delete('auth_token');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}
