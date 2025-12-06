import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fileService } from '@/lib/file-service';
import { withRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for file uploads

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 file uploads per 10 minutes per user
    const rateLimitResult = await withRateLimit(request, {
      limit: 10,
      window: 600, // 10 minutes
      identifier: () => `file-upload:${session.userId}`,
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') ? parseInt(formData.get('projectId') as string) : undefined;
    const taskId = formData.get('taskId') ? parseInt(formData.get('taskId') as string) : undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId && !taskId) {
      return NextResponse.json(
        { error: 'Either projectId or taskId must be provided' },
        { status: 400 }
      );
    }

    // Use file-service microservice
    const result = await fileService.uploadFile(file, projectId, taskId);

    if (result.error) {
      console.error('File service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      file: result.file,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') ? parseInt(searchParams.get('projectId')!) : undefined;
    const taskId = searchParams.get('taskId') ? parseInt(searchParams.get('taskId')!) : undefined;

    if (!projectId && !taskId) {
      return NextResponse.json(
        { error: 'Either projectId or taskId must be provided' },
        { status: 400 }
      );
    }

    // Use file-service microservice
    const result = await fileService.getFiles(projectId, taskId);

    if (result.error) {
      console.error('File service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ files: result.files || [] });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

