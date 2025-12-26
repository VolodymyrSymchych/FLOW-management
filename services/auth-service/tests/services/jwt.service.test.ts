import { JWTService, JWTPayload } from '../../src/services/jwt.service';

// Mock jose library
jest.mock('jose', () => ({
    SignJWT: jest.fn().mockImplementation((payload: Record<string, unknown>) => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        setIssuer: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('mock-jwt-token'),
        _payload: payload,
    })),
    jwtVerify: jest.fn(),
    decodeJwt: jest.fn(),
}));

// Mock config
jest.mock('../../src/config', () => ({
    config: {
        jwt: {
            secret: 'test-secret-key-minimum-32-characters-long',
            issuer: 'test-issuer',
            expiresIn: '1h',
        },
    },
}));

// Mock shared package with controllable getRedisClient
const mockRedisClient = {
    setex: jest.fn().mockResolvedValue('OK'),
    exists: jest.fn().mockResolvedValue(0),
};

let redisClientMock: typeof mockRedisClient | null = null;

jest.mock('@project-scope-analyzer/shared', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'UnauthorizedError';
        }
    },
    getRedisClient: jest.fn(() => redisClientMock),
}));

// Import jose after mocking
import { jwtVerify, decodeJwt } from 'jose';
import { getRedisClient } from '@project-scope-analyzer/shared';

describe('JWTService', () => {
    let jwtService: JWTService;

    beforeEach(() => {
        jwtService = new JWTService();
        jest.clearAllMocks();
        redisClientMock = null;
    });

    describe('createToken', () => {
        it('should create a valid JWT token', async () => {
            const payload: JWTPayload = {
                userId: 1,
                email: 'test@example.com',
                username: 'testuser',
                role: 'user',
            };

            const token = await jwtService.createToken(payload);

            expect(token).toBe('mock-jwt-token');
        });

        it('should include default role if not provided', async () => {
            const payload: JWTPayload = {
                userId: 1,
                email: 'test@example.com',
                username: 'testuser',
            };

            const token = await jwtService.createToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token and return payload', async () => {
            const mockPayload = {
                userId: 1,
                email: 'test@example.com',
                username: 'testuser',
                role: 'user',
            };

            (jwtVerify as jest.Mock).mockResolvedValue({
                payload: mockPayload,
            });

            const result = await jwtService.verifyToken('valid-token');

            expect(result).toEqual(mockPayload);
        });

        it('should throw UnauthorizedError for invalid token', async () => {
            (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

            await expect(jwtService.verifyToken('invalid-token')).rejects.toThrow(
                'Invalid or expired token'
            );
        });

        it('should throw UnauthorizedError for token with missing payload fields', async () => {
            (jwtVerify as jest.Mock).mockResolvedValue({
                payload: { userId: 1 }, // Missing email and username
            });

            await expect(jwtService.verifyToken('incomplete-token')).rejects.toThrow(
                'Invalid token payload'
            );
        });

        it('should throw UnauthorizedError for blacklisted token', async () => {
            redisClientMock = {
                setex: jest.fn().mockResolvedValue('OK'),
                exists: jest.fn().mockResolvedValue(1), // Token is blacklisted
            };

            await expect(jwtService.verifyToken('blacklisted-token')).rejects.toThrow(
                'Token has been revoked'
            );
        });
    });

    describe('blacklistToken', () => {
        it('should handle blacklisting when Redis is not available', async () => {
            redisClientMock = null;
            await expect(jwtService.blacklistToken('some-token')).resolves.not.toThrow();
        });

        it('should skip blacklisting for token without expiration', async () => {
            redisClientMock = mockRedisClient;
            (decodeJwt as jest.Mock).mockReturnValue({
                // No exp field
            });

            await expect(jwtService.blacklistToken('no-exp-token')).resolves.not.toThrow();
            expect(mockRedisClient.setex).not.toHaveBeenCalled();
        });

        it('should skip blacklisting for already expired token', async () => {
            redisClientMock = mockRedisClient;
            (decodeJwt as jest.Mock).mockReturnValue({
                exp: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
            });

            await expect(jwtService.blacklistToken('expired-token')).resolves.not.toThrow();
            expect(mockRedisClient.setex).not.toHaveBeenCalled();
        });

        it('should successfully blacklist a valid token', async () => {
            redisClientMock = {
                setex: jest.fn().mockResolvedValue('OK'),
                exists: jest.fn().mockResolvedValue(0),
            };
            (decodeJwt as jest.Mock).mockReturnValue({
                exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
            });

            await jwtService.blacklistToken('valid-token');

            expect(redisClientMock.setex).toHaveBeenCalled();
        });

        it('should handle Redis error gracefully during blacklisting', async () => {
            redisClientMock = {
                setex: jest.fn().mockRejectedValue(new Error('Redis error')),
                exists: jest.fn().mockResolvedValue(0),
            };
            (decodeJwt as jest.Mock).mockReturnValue({
                exp: Math.floor(Date.now() / 1000) + 3600,
            });

            // Should not throw even when Redis fails
            await expect(jwtService.blacklistToken('error-token')).resolves.not.toThrow();
        });
    });

    describe('isTokenBlacklisted', () => {
        it('should return false when Redis is not available', async () => {
            redisClientMock = null;

            const result = await jwtService.isTokenBlacklisted('some-token');

            expect(result).toBe(false);
        });

        it('should return true when token is blacklisted', async () => {
            redisClientMock = {
                setex: jest.fn(),
                exists: jest.fn().mockResolvedValue(1),
            };

            const result = await jwtService.isTokenBlacklisted('blacklisted-token');

            expect(result).toBe(true);
            expect(redisClientMock.exists).toHaveBeenCalled();
        });

        it('should return false when token is not blacklisted', async () => {
            redisClientMock = {
                setex: jest.fn(),
                exists: jest.fn().mockResolvedValue(0),
            };

            const result = await jwtService.isTokenBlacklisted('valid-token');

            expect(result).toBe(false);
        });

        it('should return false and handle Redis error gracefully', async () => {
            redisClientMock = {
                setex: jest.fn(),
                exists: jest.fn().mockRejectedValue(new Error('Redis error')),
            };

            const result = await jwtService.isTokenBlacklisted('error-token');

            expect(result).toBe(false);
        });
    });
});
