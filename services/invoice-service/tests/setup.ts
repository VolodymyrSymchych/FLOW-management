import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.APP_URL = 'http://localhost:3000';

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
    ValidationError: class ValidationError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ValidationError';
        }
    },
}));

jest.setTimeout(10000);
