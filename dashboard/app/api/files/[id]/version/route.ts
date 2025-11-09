import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';
import { uploadFile } from '../../../../../../server/r2-storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const parentFile = await storage.getFileAttachment(id);

    if (!parentFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verify ownership
    if (parentFile.projectId) {
      const project = await storage.getProject(parentFile.projectId);
      if (!project || project.userId !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload new version to R2
    const folder = parentFile.projectId
      ? `projects/${parentFile.projectId}`
      : `tasks/${parentFile.taskId}`;
    const { key, url } = await uploadFile(
      buffer,
      file.name,
      file.type || 'application/octet-stream',
      folder
    );

    // Get latest version number
    const versions = await storage.getFileVersions(id);
    const latestVersion = versions.length > 0
      ? Math.max(...versions.map(v => v.version))
      : parentFile.version;

    // Create new version record
    const newVersion = await storage.createFileAttachment({
      projectId: parentFile.projectId,
      taskId: parentFile.taskId,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      r2Key: key,
      uploadedBy: session.userId,
      version: latestVersion + 1,
      parentFileId: id,
    });

    return NextResponse.json({
      file: newVersion,
      url,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file version:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file version' },
      { status: 500 }
    );
  }
}

