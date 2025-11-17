import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { comments } from '../../../../../../shared/schema';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/comments/[commentId]/resolve - Resolve or unresolve a comment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const commentId = parseInt(params.commentId);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    const body = await request.json();
    const { resolved } = body;

    if (typeof resolved !== 'boolean') {
      return NextResponse.json(
        { error: 'resolved must be a boolean' },
        { status: 400 }
      );
    }

    // Verify comment exists
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Update comment status
    const [updatedComment] = await db
      .update(comments)
      .set({
        status: resolved ? 'resolved' : 'active',
        resolvedAt: resolved ? new Date() : null,
        resolvedBy: resolved ? session.userId : null,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    console.error('Error resolving comment:', error);
    return NextResponse.json(
      { error: 'Failed to resolve comment' },
      { status: 500 }
    );
  }
}

