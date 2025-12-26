// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock DB
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    orderBy: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};

jest.mock('../../src/db', () => ({
    db: mockDb,
    fileAttachments: {
        id: 'id',
        projectId: 'projectId',
        taskId: 'taskId',
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        parentFileId: 'parentFileId',
        version: 'version',
    },
}));

// Mock R2 service
const mockR2Service = {
    uploadFile: jest.fn().mockResolvedValue({ key: 'test-key', url: 'https://files.example.com/test-key' }),
    getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn().mockReturnValue('https://files.example.com/test-key'),
};

jest.mock('../../src/services/r2.service', () => ({
    r2Service: mockR2Service,
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((f, v) => ({ eq: f, v })),
    and: jest.fn((...a) => ({ and: a })),
    desc: jest.fn((f) => ({ desc: f })),
    isNull: jest.fn((f) => ({ isNull: f })),
}));

import { FileService } from '../../src/services/file.service';

describe('FileService', () => {
    let fileService: FileService;

    const mockFile = {
        id: 1,
        projectId: 1,
        taskId: null,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        r2Key: 'projects/1/123_test.pdf',
        uploadedBy: 1,
        version: 1,
        parentFileId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    beforeEach(() => {
        fileService = new FileService();
        jest.clearAllMocks();

        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.insert.mockReturnThis();
        mockDb.values.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
    });

    describe('uploadFile', () => {
        it('should upload file with projectId', async () => {
            mockDb.returning.mockResolvedValue([mockFile]);

            const result = await fileService.uploadFile(
                Buffer.from('test'),
                'test.pdf',
                'application/pdf',
                1024,
                1,
                1,
                undefined
            );

            expect(result.id).toBe(1);
            expect(mockR2Service.uploadFile).toHaveBeenCalled();
        });

        it('should upload file with taskId', async () => {
            mockDb.returning.mockResolvedValue([{ ...mockFile, projectId: null, taskId: 1 }]);

            const result = await fileService.uploadFile(
                Buffer.from('test'),
                'test.pdf',
                'application/pdf',
                1024,
                1,
                undefined,
                1
            );

            expect(result.taskId).toBe(1);
        });

        it('should throw ValidationError when no projectId or taskId', async () => {
            await expect(
                fileService.uploadFile(Buffer.from('test'), 'test.pdf', 'application/pdf', 1024, 1)
            ).rejects.toThrow('Either projectId or taskId must be provided');
        });
    });

    describe('getFiles', () => {
        it('should return files by projectId', async () => {
            mockDb.orderBy.mockResolvedValue([mockFile]);

            const result = await fileService.getFiles(1);

            expect(result).toHaveLength(1);
        });

        it('should return files by taskId', async () => {
            mockDb.orderBy.mockResolvedValue([mockFile]);

            const result = await fileService.getFiles(undefined, 1);

            expect(result).toHaveLength(1);
        });

        it('should return files by both projectId and taskId', async () => {
            mockDb.orderBy.mockResolvedValue([mockFile]);

            const result = await fileService.getFiles(1, 1);

            expect(result).toHaveLength(1);
        });

        it('should throw ValidationError when no projectId or taskId', async () => {
            await expect(fileService.getFiles()).rejects.toThrow('Either projectId or taskId must be provided');
        });
    });

    describe('getFile', () => {
        it('should return file when found', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);

            const result = await fileService.getFile(1);

            expect(result.id).toBe(1);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(fileService.getFile(999)).rejects.toThrow('File not found');
        });
    });

    describe('deleteFile', () => {
        it('should delete file when uploader', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);

            await fileService.deleteFile(1, 1);

            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should throw ForbiddenError when not uploader', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockFile, uploadedBy: 999 }]);

            await expect(fileService.deleteFile(1, 1)).rejects.toThrow('You can only delete files you uploaded');
        });
    });

    describe('createVersion', () => {
        it('should create version when uploader and has projectId', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);
            mockDb.returning.mockResolvedValue([{ ...mockFile, id: 2, version: 2, parentFileId: 1 }]);

            const result = await fileService.createVersion(
                1,
                Buffer.from('test'),
                'test-v2.pdf',
                'application/pdf',
                2048,
                1
            );

            expect(result.version).toBe(2);
            expect(result.parentFileId).toBe(1);
        });

        it('should create version when uploader and has taskId', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockFile, projectId: null, taskId: 1 }]);
            mockDb.returning.mockResolvedValue([{ ...mockFile, id: 2, version: 2, parentFileId: 1, projectId: null, taskId: 1 }]);

            const result = await fileService.createVersion(
                1,
                Buffer.from('test'),
                'test-v2.pdf',
                'application/pdf',
                2048,
                1
            );

            expect(result.version).toBe(2);
        });

        it('should throw ForbiddenError when not uploader', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockFile, uploadedBy: 999 }]);

            await expect(
                fileService.createVersion(1, Buffer.from('test'), 'test.pdf', 'application/pdf', 1024, 1)
            ).rejects.toThrow('You can only create versions of files you uploaded');
        });
    });

    describe('getVersions', () => {
        it('should return versions for root file', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);
            mockDb.orderBy.mockResolvedValue([mockFile, { ...mockFile, id: 2, version: 2 }]);

            const result = await fileService.getVersions(1);

            expect(result).toHaveLength(2);
        });

        it('should return versions for child file', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockFile, parentFileId: 1 }]);
            mockDb.orderBy.mockResolvedValue([mockFile]);

            const result = await fileService.getVersions(2);

            expect(result).toHaveLength(1);
        });
    });

    describe('getDownloadUrl', () => {
        it('should return signed download URL', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);

            const result = await fileService.getDownloadUrl(1);

            expect(result).toBe('https://signed-url.example.com');
            expect(mockR2Service.getSignedUrl).toHaveBeenCalledWith(mockFile.r2Key, 3600, mockFile.fileName);
        });

        it('should use custom expiration', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);

            await fileService.getDownloadUrl(1, 7200);

            expect(mockR2Service.getSignedUrl).toHaveBeenCalledWith(mockFile.r2Key, 7200, mockFile.fileName);
        });
    });

    describe('updateMetadata', () => {
        it('should update metadata when uploader', async () => {
            mockDb.limit.mockResolvedValue([mockFile]);
            mockDb.returning.mockResolvedValue([{ ...mockFile, fileName: 'updated.pdf' }]);

            const result = await fileService.updateMetadata(1, 1, { fileName: 'updated.pdf' });

            expect(result.fileName).toBe('updated.pdf');
        });

        it('should throw ForbiddenError when not uploader', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockFile, uploadedBy: 999 }]);

            await expect(
                fileService.updateMetadata(1, 1, { fileName: 'updated.pdf' })
            ).rejects.toThrow('You can only update files you uploaded');
        });
    });
});
