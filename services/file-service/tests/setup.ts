import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.AWS_ENDPOINT = 'https://test.r2.cloudflarestorage.com';
process.env.AWS_BUCKET_NAME = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://files.example.com';

jest.mock('@project-scope-analyzer/shared', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'NotFoundError';
        }
    },
    ForbiddenError: class ForbiddenError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ForbiddenError';
        }
    },
    ValidationError: class ValidationError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ValidationError';
        }
    },
}));

jest.setTimeout(10000);
