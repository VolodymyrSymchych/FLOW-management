import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';

// GET /api/chat/chats/[id] - Get chat by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats/${params.id}`, {
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
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

// PUT /api/chat/chats/[id] - Update chat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const body = await request.json();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats/${params.id}`, {
      method: 'PUT',
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/chats/[id] - Delete chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const response = await fetch(`${CHAT_SERVICE_URL}/chats/${params.id}`, {
      method: 'DELETE',
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
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}

