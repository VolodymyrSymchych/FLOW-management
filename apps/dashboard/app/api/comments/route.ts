import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/comments - Get comments for an entity
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    if (!['task', 'project'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be "task" or "project"' },
        { status: 400 }
      );
    }

    const entityIdNum = parseInt(entityId);
    if (isNaN(entityIdNum)) {
      return NextResponse.json({ error: 'Invalid entity ID' }, { status: 400 });
    }

    const comments = await storage.getComments(entityType, entityIdNum);

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments - Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { entityType, entityId, content, parentId, mentions } = body;

    if (!entityType || !entityId || !content) {
      return NextResponse.json(
        { error: 'entityType, entityId, and content are required' },
        { status: 400 }
      );
    }

    if (!['task', 'project'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be "task" or "project"' },
        { status: 400 }
      );
    }

    // Extract mentions from content (@username pattern)
    const mentionPattern = /@(\w+)/g;
    const extractedMentions: number[] = [];
    
    // Extract usernames from content
    const usernames = content.match(mentionPattern)?.map(m => m.substring(1)) || [];
    
    // Fetch user IDs for mentioned usernames
    for (const username of usernames) {
      const mentionedUser = await storage.getUserByUsername(username);
      if (mentionedUser && mentionedUser.id !== session.userId) {
        extractedMentions.push(mentionedUser.id);
      }
    }
    
    // Also add manually provided mentions
    if (mentions && Array.isArray(mentions)) {
      for (const userId of mentions) {
        if (!extractedMentions.includes(userId) && userId !== session.userId) {
          extractedMentions.push(userId);
        }
      }
    }

    // Build comment data - only include fields that are provided
    // Don't include status, resolvedAt, resolvedBy - let DB use defaults or skip if columns don't exist
    const commentData: any = {
      userId: session.userId,
      entityType,
      entityId: parseInt(entityId),
      content: content.trim(),
    };

    if (parentId) {
      commentData.parentId = parseInt(parentId);
    }

    if (extractedMentions.length > 0) {
      commentData.mentions = JSON.stringify(extractedMentions);
    }

    // Don't set status - let the database handle it with default value
    // This allows the code to work even if the migration hasn't been applied yet
    const comment = await storage.createComment(commentData);

      // Create notifications for mentioned users
    if (extractedMentions.length > 0) {
      for (const mentionedUserId of extractedMentions) {
        if (mentionedUserId !== session.userId) {
          await storage.createNotification({
            userId: mentionedUserId,
            type: 'mention',
            title: 'You were mentioned in a comment',
            content: `You were mentioned in a comment on ${entityType} #${entityId}`,
            actionUrl: `/${entityType}s/${entityId}`,
          });
        }
      }
    }

    // Get full comment with user info
    const user = await storage.getUser(comment.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 500 }
      );
    }

    const fullComment = {
      ...comment,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      replies: [],
    };

    return NextResponse.json(
      { comment: fullComment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating comment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      cause: error.cause,
    });
    
    // Check if it's a database schema error (missing columns)
    if (error.message?.includes('column') || error.code === '42703') {
      return NextResponse.json(
        { 
          error: 'Database schema mismatch. Please run migrations.',
          details: error.message || 'Unknown error',
          code: error.code,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create comment',
        details: error.message || 'Unknown error',
        code: error.code,
      },
      { status: 500 }
    );
  }
}

