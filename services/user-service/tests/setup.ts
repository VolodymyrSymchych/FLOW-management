// Global test setup for user-service
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock the shared package
jest.mock('@project-scope-analyzer/shared', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(entity: string, id: string) {
            super(`${entity} not found: ${id}`);
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

afterAll(async () => {
    // Cleanup
});
