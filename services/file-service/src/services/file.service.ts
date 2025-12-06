import { db, fileAttachments, FileAttachment, InsertFileAttachment } from '../db';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { r2Service } from './r2.service';
import { logger, NotFoundError, ForbiddenError, ValidationError } from '@project-scope-analyzer/shared';

export class FileService {
    /**
     * Upload a new file
     */
    async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        fileType: string,
        fileSize: number,
        userId: number,
        projectId?: number,
        taskId?: number
    ): Promise<FileAttachment> {
        // Validate that either projectId or taskId is provided
        if (!projectId && !taskId) {
            throw new ValidationError('Either projectId or taskId must be provided');
        }

        // Determine folder based on context
        const folder = projectId ? `projects/${projectId}` : `tasks/${taskId}`;

        // Upload to R2
        const { key, url } = await r2Service.uploadFile(fileBuffer, fileName, fileType, folder);

        // Create database record
        const [file] = await db
            .insert(fileAttachments)
            .values({
                projectId: projectId || null,
                taskId: taskId || null,
                fileName,
                fileType,
                fileSize,
                r2Key: key,
                uploadedBy: userId,
                version: 1,
                parentFileId: null,
            })
            .returning();

        logger.info('File uploaded', { fileId: file.id, userId, fileName });
        return file;
    }

    /**
     * Get files by project or task
     */
    async getFiles(projectId?: number, taskId?: number): Promise<FileAttachment[]> {
        if (!projectId && !taskId) {
            throw new ValidationError('Either projectId or taskId must be provided');
        }

        const conditions = [isNull(fileAttachments.deletedAt)];

        if (projectId) {
            conditions.push(eq(fileAttachments.projectId, projectId));
        }
        if (taskId) {
            conditions.push(eq(fileAttachments.taskId, taskId));
        }

        const files = await db
            .select()
            .from(fileAttachments)
            .where(and(...conditions))
            .orderBy(desc(fileAttachments.createdAt));

        return files;
    }

    /**
     * Get file by ID
     */
    async getFile(fileId: number): Promise<FileAttachment> {
        const [file] = await db
            .select()
            .from(fileAttachments)
            .where(and(eq(fileAttachments.id, fileId), isNull(fileAttachments.deletedAt)))
            .limit(1);

        if (!file) {
            throw new NotFoundError('File not found');
        }

        return file;
    }

    /**
     * Delete file (soft delete)
     */
    async deleteFile(fileId: number, userId: number): Promise<void> {
        const file = await this.getFile(fileId);

        // Check if user is the uploader
        if (file.uploadedBy !== userId) {
            throw new ForbiddenError('You can only delete files you uploaded');
        }

        // Soft delete in database
        await db
            .update(fileAttachments)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(eq(fileAttachments.id, fileId));

        // Note: We don't delete from R2 immediately for recovery purposes
        // Can implement hard delete with cron job later

        logger.info('File deleted', { fileId, userId });
    }

    /**
     * Create a new version of a file
     */
    async createVersion(
        parentFileId: number,
        fileBuffer: Buffer,
        fileName: string,
        fileType: string,
        fileSize: number,
        userId: number
    ): Promise<FileAttachment> {
        const parentFile = await this.getFile(parentFileId);

        // Check if user is the uploader
        if (parentFile.uploadedBy !== userId) {
            throw new ForbiddenError('You can only create versions of files you uploaded');
        }

        // Determine folder
        const folder = parentFile.projectId
            ? `projects/${parentFile.projectId}`
            : `tasks/${parentFile.taskId}`;

        // Upload to R2
        const { key, url } = await r2Service.uploadFile(fileBuffer, fileName, fileType, folder);

        // Create new version
        const [newVersion] = await db
            .insert(fileAttachments)
            .values({
                projectId: parentFile.projectId,
                taskId: parentFile.taskId,
                fileName,
                fileType,
                fileSize,
                r2Key: key,
                uploadedBy: userId,
                version: parentFile.version + 1,
                parentFileId: parentFileId,
            })
            .returning();

        logger.info('File version created', { fileId: newVersion.id, parentFileId, version: newVersion.version });
        return newVersion;
    }

    /**
     * Get all versions of a file
     */
    async getVersions(fileId: number): Promise<FileAttachment[]> {
        const file = await this.getFile(fileId);

        // Get the root file (if this is a version)
        const rootFileId = file.parentFileId || fileId;

        // Get all versions
        const versions = await db
            .select()
            .from(fileAttachments)
            .where(
                and(
                    eq(fileAttachments.parentFileId, rootFileId),
                    isNull(fileAttachments.deletedAt)
                )
            )
            .orderBy(desc(fileAttachments.version));

        return versions;
    }

    /**
     * Get download URL for a file
     */
    async getDownloadUrl(fileId: number, expiresIn: number = 3600): Promise<string> {
        const file = await this.getFile(fileId);
        const url = await r2Service.getSignedUrl(file.r2Key, expiresIn, file.fileName);
        return url;
    }

    /**
     * Update file metadata
     */
    async updateMetadata(
        fileId: number,
        userId: number,
        updates: { fileName?: string }
    ): Promise<FileAttachment> {
        const file = await this.getFile(fileId);

        // Check if user is the uploader
        if (file.uploadedBy !== userId) {
            throw new ForbiddenError('You can only update files you uploaded');
        }

        const [updated] = await db
            .update(fileAttachments)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(fileAttachments.id, fileId))
            .returning();

        logger.info('File metadata updated', { fileId, userId });
        return updated;
    }
}

export const fileService = new FileService();
