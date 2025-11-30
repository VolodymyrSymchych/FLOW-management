import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { uploadFile, deleteFile } from '../../../../server/r2-storage';
import { withRateLimit } from '@/lib/rate-limit';
import { validateFileType, validateFileSize, sanitizeFilename, ALLOWED_FILE_TYPES } from '@/lib/file-security';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { db } from '@/server/db';
import { fileAttachments } from '@/shared/schema';
import { eq, desc, isNull, and, or } from 'drizzle-orm';

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
    const projectId = formData.get('projectId') ? parseInt(formData.get('projectId') as string) : null;
    const taskId = formData.get('taskId') ? parseInt(formData.get('taskId') as string) : null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId && !taskId) {
      return NextResponse.json(
        { error: 'Either projectId or taskId must be provided' },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 }
      );
    }

    // Validate file type (MIME)
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: PDF, images (JPEG, PNG, GIF, WebP), Office documents (Word, Excel, PowerPoint), text files, and ZIP archives',
        },
        { status: 400 }
      );
    }

    // Validate file content (magic numbers) to prevent MIME type spoofing
    const contentValidation = await validateFileType(file);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error || 'File validation failed' },
        { status: 400 }
      );
    }

    // Verify project ownership if projectId is provided
    if (projectId) {
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Verify task ownership if taskId is provided
    if (taskId) {
      const task = await storage.getTask(taskId);
      if (!task || task.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename to prevent path traversal attacks
    const sanitizedFileName = sanitizeFilename(file.name);

    // Upload to R2
    const folder = projectId ? `projects/${projectId}` : `tasks/${taskId}`;
    const { key, url } = await uploadFile(
      buffer,
      sanitizedFileName,
      file.type || 'application/octet-stream',
      folder
    );

    // Create database record
    const fileAttachment = await storage.createFileAttachment({
      projectId: projectId || null,
      taskId: taskId || null,
      fileName: sanitizedFileName,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      r2Key: key,
      uploadedBy: session.userId,
      version: 1,
      parentFileId: null,
    });

    // Invalidate caches after creating file
    await invalidateOnUpdate('file', fileAttachment.id, session.userId, {
      projectId: projectId || undefined,
      taskId: taskId || undefined,
    });

    return NextResponse.json({
      file: fileAttachment,
      url,
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

    // Verify project ownership if projectId is provided
    if (projectId) {
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Verify task ownership if taskId is provided
    if (taskId) {
      const task = await storage.getTask(taskId);
      if (!task || task.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Use different cache key based on filter
    const cacheKey = projectId
      ? CacheKeys.filesByProject(projectId)
      : CacheKeys.filesByTask(taskId!);

    // Cache files for 5 minutes with timestamp validation
    const filesData = await cachedWithValidation(
      cacheKey,
      async () => await storage.getFileAttachments(projectId, taskId),
      {
        ttl: 300, // 5 minutes
        validate: true,
        getUpdatedAt: async () => {
          try {
            // Get most recent file update based on filter
            const result = projectId
              ? await db
                  .select({ updatedAt: fileAttachments.updatedAt })
                  .from(fileAttachments)
                  .where(and(
                    isNull(fileAttachments.deletedAt),
                    eq(fileAttachments.projectId, projectId)
                  ))
                  .orderBy(desc(fileAttachments.updatedAt))
                  .limit(1)
              : await db
                  .select({ updatedAt: fileAttachments.updatedAt })
                  .from(fileAttachments)
                  .where(and(
                    isNull(fileAttachments.deletedAt),
                    eq(fileAttachments.taskId, taskId!)
                  ))
                  .orderBy(desc(fileAttachments.updatedAt))
                  .limit(1);

            return result[0]?.updatedAt || null;
          } catch (error) {
            console.warn('[Files] Error getting timestamps:', error);
            return null;
          }
        },
      }
    );

    return NextResponse.json({ files: filesData });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

