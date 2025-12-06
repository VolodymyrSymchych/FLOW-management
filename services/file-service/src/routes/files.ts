import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { fileController } from '../controllers/file.controller';
import { AuthenticatedRequest } from '@project-scope-analyzer/shared';

const router = Router();

// All routes require authentication
router.use(authMiddleware as any);

// File operations
router.post(
    '/',
    fileController.uploadMiddleware,
    (req, res, next) => fileController.uploadFile(req as AuthenticatedRequest, res, next)
);

router.get('/', (req, res, next) => fileController.getFiles(req as AuthenticatedRequest, res, next));

router.get('/:id', (req, res, next) => fileController.getFile(req as AuthenticatedRequest, res, next));

router.get('/:id/download', (req, res, next) => fileController.downloadFile(req as AuthenticatedRequest, res, next));

router.delete('/:id', (req, res, next) => fileController.deleteFile(req as AuthenticatedRequest, res, next));

router.post(
    '/:id/version',
    fileController.uploadMiddleware,
    (req, res, next) => fileController.createVersion(req as AuthenticatedRequest, res, next)
);

router.get('/:id/versions', (req, res, next) => fileController.getVersions(req as AuthenticatedRequest, res, next));

router.put('/:id', (req, res, next) => fileController.updateMetadata(req as AuthenticatedRequest, res, next));

export default router;
