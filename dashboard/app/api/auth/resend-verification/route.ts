import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Call auth-service to resend verification email
        const result = await authService.resendVerificationEmail(email);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification email sent successfully',
        });
    } catch (error: any) {
        console.error('Resend verification email error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to resend verification email' },
            { status: 500 }
        );
    }
}
