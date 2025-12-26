import bcrypt from 'bcryptjs';

// Mock database - must be defined before mock
jest.mock('../../src/db', () => {
    const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
    };
    return {
        db: mockDb,
        users: { id: 'id', email: 'email', username: 'username', provider: 'provider', providerId: 'providerId' },
        emailVerifications: { id: 'id', token: 'token', userId: 'userId' },
    };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ field, value })),
    and: jest.fn((...conditions) => ({ type: 'and', conditions })),
}));

// Import after mocks are set up
import { AuthService } from '../../src/services/auth.service';
import { db } from '../../src/db';

// Cast db to get access to mock methods
const mockDb = db as unknown as {
    select: jest.Mock;
    from: jest.Mock;
    where: jest.Mock;
    limit: jest.Mock;
    insert: jest.Mock;
    values: jest.Mock;
    returning: jest.Mock;
    update: jest.Mock;
    set: jest.Mock;
};

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();

        // Reset mock chain
        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.insert.mockReturnThis();
        mockDb.values.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
            mockDb.limit.mockResolvedValue([mockUser]);

            const result = await authService.getUserById(1);

            expect(result).toEqual(mockUser);
            expect(mockDb.select).toHaveBeenCalled();
        });

        it('should return null when user not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await authService.getUserById(999);

            expect(result).toBeNull();
        });
    });

    describe('getUserByEmail', () => {
        it('should return user when found', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
            mockDb.limit.mockResolvedValue([mockUser]);

            const result = await authService.getUserByEmail('test@example.com');

            expect(result).toEqual(mockUser);
        });

        it('should search with lowercase email', async () => {
            mockDb.limit.mockResolvedValue([]);

            await authService.getUserByEmail('TEST@EXAMPLE.COM');

            expect(mockDb.where).toHaveBeenCalled();
        });
    });

    describe('getUserByUsername', () => {
        it('should return user when found', async () => {
            const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
            mockDb.limit.mockResolvedValue([mockUser]);

            const result = await authService.getUserByUsername('testuser');

            expect(result).toEqual(mockUser);
        });

        it('should return null when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await authService.getUserByUsername('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should create user successfully', async () => {
            const mockNewUser = {
                id: 1,
                email: 'new@example.com',
                username: 'newuser',
                fullName: 'New User',
            };

            // No existing user for both email and username checks
            mockDb.limit
                .mockResolvedValueOnce([]) // email check
                .mockResolvedValueOnce([]); // username check
            mockDb.returning.mockResolvedValue([mockNewUser]);

            const result = await authService.createUser({
                email: 'new@example.com',
                username: 'newuser',
                password: 'password123',
                fullName: 'New User',
            });

            expect(result).toEqual(mockNewUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        });

        it('should throw ConflictError when email exists', async () => {
            mockDb.limit.mockResolvedValueOnce([{ id: 1, email: 'existing@example.com' }]);

            await expect(
                authService.createUser({
                    email: 'existing@example.com',
                    username: 'newuser',
                    password: 'password123',
                })
            ).rejects.toThrow('Email already registered');
        });

        it('should throw ConflictError when username exists', async () => {
            mockDb.limit
                .mockResolvedValueOnce([]) // email doesn't exist
                .mockResolvedValueOnce([{ id: 1, username: 'existinguser' }]); // username exists

            await expect(
                authService.createUser({
                    email: 'new@example.com',
                    username: 'existinguser',
                    password: 'password123',
                })
            ).rejects.toThrow('Username already taken');
        });
    });

    describe('verifyPassword', () => {
        it('should return true for correct password', async () => {
            const mockUser = { id: 1, password: 'hashed-password' };
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.verifyPassword(mockUser as never, 'correct-password');

            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');
        });

        it('should return false for incorrect password', async () => {
            const mockUser = { id: 1, password: 'hashed-password' };
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await authService.verifyPassword(mockUser as never, 'wrong-password');

            expect(result).toBe(false);
        });

        it('should return false when user has no password (OAuth user)', async () => {
            const mockUser = { id: 1, password: null };

            const result = await authService.verifyPassword(mockUser as never, 'any-password');

            expect(result).toBe(false);
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
    });

    describe('checkAccountLockout', () => {
        it('should return not locked when Redis is null', async () => {
            const result = await authService.checkAccountLockout('test@example.com', null);

            expect(result).toEqual({ locked: false });
        });

        it('should return locked when attempts exceed max', async () => {
            const mockRedis = {
                get: jest.fn().mockResolvedValue('10'),
                ttl: jest.fn().mockResolvedValue(300),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
            };

            const result = await authService.checkAccountLockout('test@example.com', mockRedis);

            expect(result).toEqual({ locked: true, remainingTime: 300 });
        });

        it('should return not locked when attempts below max', async () => {
            const mockRedis = {
                get: jest.fn().mockResolvedValue('3'),
                ttl: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
            };

            const result = await authService.checkAccountLockout('test@example.com', mockRedis);

            expect(result).toEqual({ locked: false });
        });
    });

    describe('recordFailedLogin', () => {
        it('should do nothing when Redis is null', async () => {
            await expect(authService.recordFailedLogin('test@example.com', null)).resolves.not.toThrow();
        });

        it('should increment failed login counter', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn().mockResolvedValue(1),
                expire: jest.fn(),
                del: jest.fn(),
            };

            await authService.recordFailedLogin('test@example.com', mockRedis);

            expect(mockRedis.incr).toHaveBeenCalled();
        });

        it('should set expire on first failed attempt', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn().mockResolvedValue(1),
                expire: jest.fn(),
                del: jest.fn(),
            };

            await authService.recordFailedLogin('test@example.com', mockRedis);

            expect(mockRedis.expire).toHaveBeenCalled();
        });
    });

    describe('clearFailedLogins', () => {
        it('should do nothing when Redis is null', async () => {
            await expect(authService.clearFailedLogins('test@example.com', null)).resolves.not.toThrow();
        });

        it('should delete failed login key', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
            };

            await authService.clearFailedLogins('test@example.com', mockRedis);

            expect(mockRedis.del).toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            const mockUpdatedUser = { id: 1, email: 'test@example.com', fullName: 'Updated Name' };
            mockDb.returning.mockResolvedValue([mockUpdatedUser]);

            const result = await authService.updateUser(1, { fullName: 'Updated Name' });

            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw NotFoundError when user not found', async () => {
            mockDb.returning.mockResolvedValue([]);

            await expect(
                authService.updateUser(999, { fullName: 'Updated Name' })
            ).rejects.toThrow();
        });
    });

    describe('getUserByProvider', () => {
        it('should return user when found by provider', async () => {
            const mockUser = { id: 1, email: 'test@example.com', provider: 'google', providerId: '12345' };
            mockDb.limit.mockResolvedValue([mockUser]);

            const result = await authService.getUserByProvider('google', '12345');

            expect(result).toEqual(mockUser);
            expect(mockDb.select).toHaveBeenCalled();
        });

        it('should return null when provider user not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await authService.getUserByProvider('google', 'nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('createEmailVerification', () => {
        it('should create email verification token', async () => {
            mockDb.returning.mockResolvedValue([{ id: 1, token: 'test-token' }]);

            const result = await authService.createEmailVerification(1, 'test@example.com');

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            const mockVerification = {
                id: 1,
                userId: 1,
                token: 'valid-token',
                verified: false,
                expiresAt: new Date(Date.now() + 86400000), // 24h in future
            };
            const mockUser = { id: 1, email: 'test@example.com', emailVerified: true };

            // First call returns verification, second call returns updated user
            mockDb.limit.mockResolvedValueOnce([mockVerification]);
            mockDb.returning.mockResolvedValue([mockUser]);

            const result = await authService.verifyEmail('valid-token');

            expect(result).toEqual(mockUser);
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should throw NotFoundError when verification token not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(authService.verifyEmail('invalid-token')).rejects.toThrow();
        });

        it('should throw ValidationError when email already verified', async () => {
            const mockVerification = {
                id: 1,
                userId: 1,
                token: 'used-token',
                verified: true,
                expiresAt: new Date(Date.now() + 86400000),
            };
            mockDb.limit.mockResolvedValue([mockVerification]);

            await expect(authService.verifyEmail('used-token')).rejects.toThrow('Email already verified');
        });

        it('should throw ValidationError when token expired', async () => {
            const mockVerification = {
                id: 1,
                userId: 1,
                token: 'expired-token',
                verified: false,
                expiresAt: new Date(Date.now() - 86400000), // 24h in past
            };
            mockDb.limit.mockResolvedValue([mockVerification]);

            await expect(authService.verifyEmail('expired-token')).rejects.toThrow('Verification token expired');
        });

        it('should throw NotFoundError when user not found after verification', async () => {
            const mockVerification = {
                id: 1,
                userId: 999,
                token: 'orphan-token',
                verified: false,
                expiresAt: new Date(Date.now() + 86400000),
            };
            mockDb.limit.mockResolvedValue([mockVerification]);
            mockDb.returning.mockResolvedValue([]); // User not found

            await expect(authService.verifyEmail('orphan-token')).rejects.toThrow();
        });
    });

    describe('createPasswordResetToken', () => {
        it('should throw error when Redis is null', async () => {
            await expect(
                authService.createPasswordResetToken('test@example.com', null)
            ).rejects.toThrow('Redis client is required for password reset');
        });

        it('should create password reset token with setex', async () => {
            const mockRedis = {
                get: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
                setex: jest.fn().mockResolvedValue('OK'),
            };

            const result = await authService.createPasswordResetToken('test@example.com', mockRedis);

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(mockRedis.setex).toHaveBeenCalled();
        });

        it('should create password reset token with set fallback', async () => {
            const mockRedis = {
                get: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
                set: jest.fn().mockResolvedValue('OK'),
            };

            const result = await authService.createPasswordResetToken('test@example.com', mockRedis);

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(mockRedis.set).toHaveBeenCalled();
        });

        it('should throw error for unsupported Redis client', async () => {
            const mockRedis = {
                get: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
                // No setex or set
            };

            await expect(
                authService.createPasswordResetToken('test@example.com', mockRedis)
            ).rejects.toThrow('Redis client implementation not supported');
        });
    });

    describe('resetPassword', () => {
        it('should throw error when Redis is null', async () => {
            await expect(
                authService.resetPassword('token', 'newpassword', null)
            ).rejects.toThrow('Redis client is required for password reset');
        });

        it('should throw ValidationError for invalid token', async () => {
            const mockRedis = {
                get: jest.fn().mockResolvedValue(null),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
            };

            await expect(
                authService.resetPassword('invalid-token', 'newpassword', mockRedis)
            ).rejects.toThrow('Invalid or expired password reset token');
        });

        it('should throw NotFoundError when user not found', async () => {
            const mockRedis = {
                get: jest.fn().mockResolvedValue('unknown@example.com'),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
            };
            mockDb.limit.mockResolvedValue([]); // User not found

            await expect(
                authService.resetPassword('valid-token', 'newpassword', mockRedis)
            ).rejects.toThrow();
        });

        it('should reset password successfully', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            const mockRedis = {
                get: jest.fn().mockResolvedValue('test@example.com'),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
                ttl: jest.fn(),
            };
            mockDb.limit.mockResolvedValue([mockUser]);
            mockDb.returning.mockResolvedValue([{ ...mockUser, password: 'new-hashed-password' }]);

            const result = await authService.resetPassword('valid-token', 'newpassword', mockRedis);

            expect(result).toBeDefined();
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(mockRedis.del).toHaveBeenCalled();
        });
    });

    describe('findOrCreateOAuthUser', () => {
        it('should return existing user by provider', async () => {
            const mockUser = { id: 1, email: 'oauth@example.com', provider: 'google', providerId: '12345' };
            mockDb.limit.mockResolvedValue([mockUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'oauth@example.com',
                name: 'OAuth User',
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toEqual(mockUser);
        });

        it('should link provider to existing email user without provider', async () => {
            const existingUser = { id: 1, email: 'existing@example.com', providerId: null };
            const updatedUser = { ...existingUser, provider: 'google', providerId: '12345' };

            // First call (getUserByProvider) returns nothing
            mockDb.limit.mockResolvedValueOnce([]);
            // Second call (getUserByEmail) returns existing user
            mockDb.limit.mockResolvedValueOnce([existingUser]);
            mockDb.returning.mockResolvedValue([updatedUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'existing@example.com',
                name: 'Existing User',
                provider: 'google',
                providerId: '12345',
            });

            expect(result.providerId).toBe('12345');
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should return existing email user with provider already set', async () => {
            const existingUser = { id: 1, email: 'existing@example.com', providerId: 'existing-id', provider: 'microsoft' };

            // First call (getUserByProvider) returns nothing
            mockDb.limit.mockResolvedValueOnce([]);
            // Second call (getUserByEmail) returns existing user with provider
            mockDb.limit.mockResolvedValueOnce([existingUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'existing@example.com',
                name: 'Existing User',
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toEqual(existingUser);
        });

        it('should create new OAuth user when not found', async () => {
            const newUser = { id: 1, email: 'new@example.com', username: 'newuser', provider: 'google', providerId: '12345' };

            // getUserByProvider returns nothing
            mockDb.limit.mockResolvedValueOnce([]);
            // getUserByEmail returns nothing
            mockDb.limit.mockResolvedValueOnce([]);
            // getUserByUsername (uniqueness check) returns nothing
            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.returning.mockResolvedValue([newUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'new@example.com',
                name: 'New User',
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toEqual(newUser);
            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should create OAuth user with email-based username', async () => {
            const newUser = { id: 1, email: 'nodisplayname@example.com', username: 'nodisplayname', provider: 'google', providerId: '12345' };

            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.returning.mockResolvedValue([newUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'nodisplayname@example.com',
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toEqual(newUser);
        });

        it('should handle username collision by adding counter', async () => {
            const newUser = { id: 1, email: 'test@example.com', username: 'test1', provider: 'google', providerId: '12345' };

            mockDb.limit.mockResolvedValueOnce([]); // getUserByProvider
            mockDb.limit.mockResolvedValueOnce([]); // getUserByEmail
            mockDb.limit.mockResolvedValueOnce([{ id: 2, username: 'test' }]); // First username check - taken
            mockDb.limit.mockResolvedValueOnce([]); // Second username check - available
            mockDb.returning.mockResolvedValue([newUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'test@example.com',
                name: 'Test',
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toEqual(newUser);
        });

        it('should generate random username for short names', async () => {
            const newUser = { id: 1, email: 'ab@example.com', username: 'userxxxx', provider: 'google', providerId: '12345' };

            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.limit.mockResolvedValueOnce([]);
            mockDb.returning.mockResolvedValue([newUser]);

            const result = await authService.findOrCreateOAuthUser({
                email: 'ab@example.com',
                name: 'AB', // Too short
                provider: 'google',
                providerId: '12345',
            });

            expect(result).toBeDefined();
        });
    });

    describe('createUser without password', () => {
        it('should create user without password (OAuth flow)', async () => {
            const mockNewUser = {
                id: 1,
                email: 'oauth@example.com',
                username: 'oauthuser',
                password: null,
            };

            mockDb.limit
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);
            mockDb.returning.mockResolvedValue([mockNewUser]);

            const result = await authService.createUser({
                email: 'oauth@example.com',
                username: 'oauthuser',
            });

            expect(result).toEqual(mockNewUser);
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });
    });

    describe('recordFailedLogin edge cases', () => {
        it('should not set expire on subsequent attempts', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn().mockResolvedValue(5), // Not first attempt
                expire: jest.fn(),
                del: jest.fn(),
            };

            await authService.recordFailedLogin('test@example.com', mockRedis);

            expect(mockRedis.incr).toHaveBeenCalled();
            expect(mockRedis.expire).not.toHaveBeenCalled();
        });

        it('should handle Redis error gracefully', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn().mockRejectedValue(new Error('Redis error')),
                expire: jest.fn(),
                del: jest.fn(),
            };

            await expect(authService.recordFailedLogin('test@example.com', mockRedis)).resolves.not.toThrow();
        });
    });

    describe('checkAccountLockout edge cases', () => {
        it('should return remainingTime 0 when TTL is negative', async () => {
            const mockRedis = {
                get: jest.fn().mockResolvedValue('10'),
                ttl: jest.fn().mockResolvedValue(-1),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
            };

            const result = await authService.checkAccountLockout('test@example.com', mockRedis);

            expect(result).toEqual({ locked: true, remainingTime: 0 });
        });

        it('should handle Redis error gracefully', async () => {
            const mockRedis = {
                get: jest.fn().mockRejectedValue(new Error('Redis error')),
                ttl: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn(),
            };

            const result = await authService.checkAccountLockout('test@example.com', mockRedis);

            expect(result).toEqual({ locked: false });
        });
    });

    describe('clearFailedLogins edge cases', () => {
        it('should handle Redis error gracefully', async () => {
            const mockRedis = {
                get: jest.fn(),
                ttl: jest.fn(),
                incr: jest.fn(),
                expire: jest.fn(),
                del: jest.fn().mockRejectedValue(new Error('Redis error')),
            };

            await expect(authService.clearFailedLogins('test@example.com', mockRedis)).resolves.not.toThrow();
        });
    });
});
