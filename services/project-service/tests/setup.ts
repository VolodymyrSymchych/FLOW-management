// Global test setup for project-service
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
}));

jest.setTimeout(10000);

afterAll(async () => {
    // Cleanup
});
