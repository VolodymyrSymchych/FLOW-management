import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';
import { getSignedUrl } from '../../../../../../server/r2-storage';

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

    // Generate signed URL (valid for 1 hour) with Content-Disposition header
    const downloadUrl = await getSignedUrl(file.r2Key, 3600, file.fileName);

    return NextResponse.json({ downloadUrl });
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

