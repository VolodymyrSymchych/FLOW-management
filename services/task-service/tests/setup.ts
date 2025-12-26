// Global test setup for task-service
import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';

jest.mock('@project-scope-analyzer/shared', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

jest.setTimeout(10000);
