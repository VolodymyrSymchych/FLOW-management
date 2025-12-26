import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';

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
