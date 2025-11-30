import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';
import { deleteFile, getSignedUrl } from '../../../../../server/r2-storage';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const file = await storage.getFileAttachment(id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (file.projectId) {
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ file });
  } catch (error: any) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const file = await storage.getFileAttachment(id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (file.projectId) {
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Delete from R2
    try {
      await deleteFile(file.r2Key);
    } catch (r2Error) {
      console.error('Error deleting file from R2:', r2Error);
      // Continue with DB deletion even if R2 deletion fails
    }

    // Delete from database
    await storage.deleteFileAttachment(id);

    // Invalidate caches after deleting file
    await invalidateOnUpdate('file', id, session.userId, {
      projectId: file.projectId || undefined,
      taskId: file.taskId || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

