// Mock database
jest.mock('../../src/db', () => {
    const mockDb = {
        query: {
            users: {
                findFirst: jest.fn(),
            },
        },
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn(),
    };
    return {
        db: mockDb,
        users: {
            id: 'id',
            email: 'email',
            username: 'username',
            isActive: 'isActive',
            fullName: 'fullName',
            avatarUrl: 'avatarUrl',
            emailVerified: 'emailVerified',
            role: 'role',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    };
});

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ field, value })),
    and: jest.fn((...conditions) => ({ type: 'and', conditions })),
    or: jest.fn((...conditions) => ({ type: 'or', conditions })),
    sql: jest.fn((strings, ...values) => ({ sql: strings.join('?'), values })),
    like: jest.fn((field, pattern) => ({ field, pattern })),
    ilike: jest.fn((field, pattern) => ({ field, pattern })),
}));

import { UserService, UserProfile } from '../../src/services/user.service';
import { db } from '../../src/db';

// Type for mock
const mockDb = db as unknown as {
    query: {
        users: {
            findFirst: jest.Mock;
        };
    };
    select: jest.Mock;
    from: jest.Mock;
    where: jest.Mock;
    limit: jest.Mock;
    update: jest.Mock;
    set: jest.Mock;
    returning: jest.Mock;
};

describe('UserService', () => {
    let userService: UserService;

    const mockUserData = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        emailVerified: true,
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();

        // Reset mock chains
        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
    });

    describe('getUserById', () => {
        it('should return user profile when found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(mockUserData);

            const result = await userService.getUserById(1);

            expect(result).not.toBeNull();
            expect(result?.id).toBe(1);
            expect(result?.email).toBe('test@example.com');
        });

        it('should return null when user not found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(null);

            const result = await userService.getUserById(999);

            expect(result).toBeNull();
        });

        it('should return null when user is inactive', async () => {
            mockDb.query.users.findFirst.mockResolvedValue({ ...mockUserData, isActive: false });

            const result = await userService.getUserById(1);

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDb.query.users.findFirst.mockRejectedValue(new Error('DB error'));

            await expect(userService.getUserById(1)).rejects.toThrow('DB error');
        });
    });

    describe('getUserByEmail', () => {
        it('should return user profile when found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(mockUserData);

            const result = await userService.getUserByEmail('test@example.com');

            expect(result).not.toBeNull();
            expect(result?.email).toBe('test@example.com');
        });

        it('should return null when user not found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(null);

            const result = await userService.getUserByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDb.query.users.findFirst.mockRejectedValue(new Error('DB error'));

            await expect(userService.getUserByEmail('test@example.com')).rejects.toThrow();
        });
    });

    describe('getUserByUsername', () => {
        it('should return user profile when found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(mockUserData);

            const result = await userService.getUserByUsername('testuser');

            expect(result).not.toBeNull();
            expect(result?.username).toBe('testuser');
        });

        it('should return null when user not found', async () => {
            mockDb.query.users.findFirst.mockResolvedValue(null);

            const result = await userService.getUserByUsername('nonexistent');

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDb.query.users.findFirst.mockRejectedValue(new Error('DB error'));

            await expect(userService.getUserByUsername('testuser')).rejects.toThrow();
        });
    });

    describe('searchUsers', () => {
        it('should return matching users', async () => {
            mockDb.limit.mockResolvedValue([mockUserData]);

            const result = await userService.searchUsers('test');

            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('testuser');
        });

        it('should return empty array when no matches', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await userService.searchUsers('nonexistent');

            expect(result).toHaveLength(0);
        });

        it('should exclude specific user when excludeUserId provided', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await userService.searchUsers('test', 1);

            expect(result).toHaveLength(0);
            expect(mockDb.where).toHaveBeenCalled();
        });

        it('should respect limit parameter', async () => {
            mockDb.limit.mockResolvedValue([mockUserData]);

            await userService.searchUsers('test', undefined, 5);

            expect(mockDb.limit).toHaveBeenCalledWith(5);
        });

        it('should throw error on database failure', async () => {
            mockDb.limit.mockRejectedValue(new Error('DB error'));

            await expect(userService.searchUsers('test')).rejects.toThrow();
        });
    });

    describe('updateUserProfile', () => {
        it('should update fullName successfully', async () => {
            const updatedUser = { ...mockUserData, fullName: 'Updated Name' };
            mockDb.returning.mockResolvedValue([updatedUser]);

            const result = await userService.updateUserProfile(1, { fullName: 'Updated Name' });

            expect(result).not.toBeNull();
            expect(result?.fullName).toBe('Updated Name');
        });

        it('should update avatarUrl successfully', async () => {
            const updatedUser = { ...mockUserData, avatarUrl: 'https://new-avatar.com/img.png' };
            mockDb.returning.mockResolvedValue([updatedUser]);

            const result = await userService.updateUserProfile(1, { avatarUrl: 'https://new-avatar.com/img.png' });

            expect(result).not.toBeNull();
            expect(result?.avatarUrl).toBe('https://new-avatar.com/img.png');
        });

        it('should update both fields successfully', async () => {
            const updatedUser = { ...mockUserData, fullName: 'New Name', avatarUrl: 'https://new.com/av.png' };
            mockDb.returning.mockResolvedValue([updatedUser]);

            const result = await userService.updateUserProfile(1, {
                fullName: 'New Name',
                avatarUrl: 'https://new.com/av.png',
            });

            expect(result?.fullName).toBe('New Name');
            expect(result?.avatarUrl).toBe('https://new.com/av.png');
        });

        it('should return null when user not found', async () => {
            mockDb.returning.mockResolvedValue([]);

            const result = await userService.updateUserProfile(999, { fullName: 'Test' });

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDb.returning.mockRejectedValue(new Error('DB error'));

            await expect(userService.updateUserProfile(1, { fullName: 'Test' })).rejects.toThrow();
        });

        it('should only update updatedAt when no fields provided', async () => {
            mockDb.returning.mockResolvedValue([mockUserData]);

            const result = await userService.updateUserProfile(1, {});

            expect(result).not.toBeNull();
            expect(mockDb.update).toHaveBeenCalled();
        });
    });
});
