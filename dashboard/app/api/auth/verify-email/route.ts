import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { invalidateUserCache } from '@/lib/user-cache';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Call auth-service
    const result = await authService.verifyEmail({ token });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Invalidate user cache after email verification
    if (result.user?.id) {
      await invalidateUserCache(result.user.id);
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Email verified successfully',
      user: result.user,
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}
