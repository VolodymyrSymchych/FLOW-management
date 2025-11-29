import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';

// GET /api/chat/messages/mentions - Get user's mentions
export async function GET(request: NextRequest) {
  try {
    const { token } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    const response = await fetch(
      `${CHAT_SERVICE_URL}/messages/mentions/me?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentions' },
      { status: 500 }
    );
  }
}

