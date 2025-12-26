// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock AWS SDK
const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: mockSend,
    })),
    PutObjectCommand: jest.fn().mockImplementation((params) => ({ type: 'put', ...params })),
    DeleteObjectCommand: jest.fn().mockImplementation((params) => ({ type: 'delete', ...params })),
    GetObjectCommand: jest.fn().mockImplementation((params) => ({ type: 'get', ...params })),
}));

const mockGetSignedUrl = jest.fn().mockResolvedValue('https://signed-url.example.com');

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: mockGetSignedUrl,
}));

// Set env vars before importing
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.AWS_ENDPOINT = 'https://test.r2.cloudflarestorage.com';
process.env.AWS_BUCKET_NAME = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://files.example.com';

import { R2Service } from '../../src/services/r2.service';

describe('R2Service', () => {
    let r2Service: R2Service;

    beforeEach(() => {
        r2Service = new R2Service();
        jest.clearAllMocks();
        mockSend.mockReset();
    });

    describe('uploadFile', () => {
        it('should upload file successfully', async () => {
            mockSend.mockResolvedValue({});

            const result = await r2Service.uploadFile(
                Buffer.from('test'),
                'test.pdf',
                'application/pdf',
                'uploads'
            );

            expect(result.key).toContain('uploads/');
            expect(result.key).toContain('test.pdf');
            expect(result.url).toContain('https://files.example.com/');
        });

        it('should sanitize filename', async () => {
            mockSend.mockResolvedValue({});

            const result = await r2Service.uploadFile(
                Buffer.from('test'),
                'test file (1).pdf',
                'application/pdf',
                'uploads'
            );

            expect(result.key).toContain('test_file__1_.pdf');
        });

        it('should throw error on upload failure', async () => {
            mockSend.mockRejectedValue(new Error('Upload failed'));

            await expect(
                r2Service.uploadFile(Buffer.from('test'), 'test.pdf', 'application/pdf')
            ).rejects.toThrow('Failed to upload file: Upload failed');
        });
    });

    describe('deleteFile', () => {
        it('should delete file successfully', async () => {
            mockSend.mockResolvedValue({});

            await r2Service.deleteFile('uploads/test.pdf');

            expect(mockSend).toHaveBeenCalled();
        });

        it('should throw error on delete failure', async () => {
            mockSend.mockRejectedValue(new Error('Delete failed'));

            await expect(r2Service.deleteFile('uploads/test.pdf')).rejects.toThrow('Failed to delete file: Delete failed');
        });
    });

    describe('getSignedUrl', () => {
        it('should generate signed URL', async () => {
            const result = await r2Service.getSignedUrl('uploads/test.pdf', 3600, 'test.pdf');

            expect(result).toBe('https://signed-url.example.com');
            expect(mockGetSignedUrl).toHaveBeenCalled();
        });

        it('should use key filename when filename not provided', async () => {
            const result = await r2Service.getSignedUrl('uploads/test.pdf', 3600);

            expect(result).toBe('https://signed-url.example.com');
        });

        it('should throw error on signed URL failure', async () => {
            mockGetSignedUrl.mockRejectedValueOnce(new Error('SignedUrl failed'));

            await expect(r2Service.getSignedUrl('uploads/test.pdf')).rejects.toThrow('Failed to generate download URL');
        });
    });

    describe('getPublicUrl', () => {
        it('should return public URL when R2_PUBLIC_URL is set', () => {
            const result = r2Service.getPublicUrl('uploads/test.pdf');

            expect(result).toBe('https://files.example.com/uploads/test.pdf');
        });
    });
});
