// Global test setup
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.JWT_ISSUER = 'test-issuer';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MAX_LOGIN_ATTEMPTS = '5';
process.env.LOCKOUT_DURATION = '300';

// Mock the shared package logger
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
    ConflictError: class ConflictError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ConflictError';
        }
    },
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'UnauthorizedError';
        }
    },
    getRedisClient: jest.fn(() => null),
}));

// Increase timeout for async operations
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
    // Add cleanup logic if needed
});
