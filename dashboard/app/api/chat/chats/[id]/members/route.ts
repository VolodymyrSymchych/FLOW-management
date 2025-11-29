import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';

// GET /api/chat/chats/[id]/members - Get chat members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats/${params.id}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chat members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat members' },
      { status: 500 }
    );
  }
}

// POST /api/chat/chats/[id]/members - Add member to chat
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const body = await request.json();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats/${params.id}/members`, {
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
    console.error('Error adding chat member:', error);
    return NextResponse.json(
      { error: 'Failed to add chat member' },
      { status: 500 }
    );
  }
}

