import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { comments } from '@/shared/schema';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/comments/[commentId] - Update a comment
 */
export async function PUT(
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

    // Verify user owns the comment
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedComment = await storage.updateComment(commentId, content.trim());

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments/[commentId] - Delete a comment
 */
export async function DELETE(
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

    // Verify user owns the comment
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    await storage.deleteComment(commentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

