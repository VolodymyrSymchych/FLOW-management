import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3004';

// POST /api/chat/messages/[id]/create-task - Create task from message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { token } = await requireAuth();

    const body = await request.json();

    const response = await fetch(
      `${CHAT_SERVICE_URL}/messages/${params.id}/create-task`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating task from message:', error);
    return NextResponse.json(
      { error: 'Failed to create task from message' },
      { status: 500 }
    );
  }
}

