import { Response, NextFunction } from 'express';
import { fileService } from '../services/file.service';
import { AuthenticatedRequest } from '@project-scope-analyzer/shared';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});

// Allowed MIME types
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
];

class FileController {
    /**
     * Upload a file
     */
    uploadMiddleware = upload.single('file');

    async uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const file = req.file;
            const { projectId, taskId } = req.body;
            const userId = req.userId!;

            if (!file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }

            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
                res.status(400).json({
                    error: 'Invalid file type. Allowed types: images, PDFs, Office documents, text files, and ZIP archives',
                });
                return;
            }

            const uploadedFile = await fileService.uploadFile(
                file.buffer,
                file.originalname,
                file.mimetype,
                file.size,
                userId,
                projectId ? parseInt(projectId) : undefined,
                taskId ? parseInt(taskId) : undefined
            );

            res.status(201).json({ file: uploadedFile });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get files
     */
    async getFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { projectId, taskId } = req.query;

            const files = await fileService.getFiles(
                projectId ? parseInt(projectId as string) : undefined,
                taskId ? parseInt(taskId as string) : undefined
            );

            res.json({ files });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get file by ID
     */
    async getFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId = parseInt(req.params.id);
            const file = await fileService.getFile(fileId);
            res.json({ file });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download file
     */
    async downloadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId = parseInt(req.params.id);
            const url = await fileService.getDownloadUrl(fileId);
            res.json({ url });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete file
     */
    async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId = parseInt(req.params.id);
            const userId = req.userId!;

            await fileService.deleteFile(fileId, userId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create file version
     */
    async createVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const parentFileId = parseInt(req.params.id);
            const file = req.file;
            const userId = req.userId!;

            if (!file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }

            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
                res.status(400).json({
                    error: 'Invalid file type',
                });
                return;
            }

            const newVersion = await fileService.createVersion(
                parentFileId,
                file.buffer,
                file.originalname,
                file.mimetype,
                file.size,
                userId
            );

            res.status(201).json({ file: newVersion });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get file versions
     */
    async getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId = parseInt(req.params.id);
            const versions = await fileService.getVersions(fileId);
            res.json({ versions });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update file metadata
     */
    async updateMetadata(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileId = parseInt(req.params.id);
            const userId = req.userId!;
            const { fileName } = req.body;

            const updated = await fileService.updateMetadata(fileId, userId, { fileName });
            res.json({ file: updated });
        } catch (error) {
            next(error);
        }
    }
}

export const fileController = new FileController();
