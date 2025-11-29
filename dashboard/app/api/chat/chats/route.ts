import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';

// GET /api/chat/chats - Get user's chats
export async function GET(request: NextRequest) {
  try {
    const { token } = await requireAuth();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chat/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const { token } = await requireAuth();

    const body = await request.json();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

