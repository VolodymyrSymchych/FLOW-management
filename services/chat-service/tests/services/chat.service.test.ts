// Mock database
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    orderBy: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
};

jest.mock('../../src/db', () => ({
    db: mockDb,
    chats: { id: 'id', type: 'type', projectId: 'projectId', teamId: 'teamId', createdBy: 'createdBy', updatedAt: 'updatedAt' },
    chatMembers: { id: 'id', chatId: 'chatId', userId: 'userId', role: 'role', joinedAt: 'joinedAt' },
    chatMessages: {},
    messageReactions: {},
}));

jest.mock('../../src/utils/pusher', () => ({
    triggerChatEvent: jest.fn().mockResolvedValue(undefined),
    PusherEvent: {
        USER_JOINED: 'USER_JOINED',
        USER_LEFT: 'USER_LEFT',
        CHAT_UPDATED: 'CHAT_UPDATED',
    },
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ eq: field, value })),
    and: jest.fn((...args) => ({ and: args })),
    or: jest.fn((...args) => ({ or: args })),
    desc: jest.fn((field) => ({ desc: field })),
    inArray: jest.fn((field, arr) => ({ inArray: field, arr })),
    sql: jest.fn((strings, ...values) => ({ sql: strings, values })),
}));

import { ChatService } from '../../src/services/chat.service';

describe('ChatService', () => {
    let chatService: ChatService;

    const mockChat = {
        id: 1,
        name: 'Test Chat',
        type: 'group',
        projectId: null,
        teamId: null,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockMember = {
        id: 1,
        chatId: 1,
        userId: 1,
        role: 'admin',
        joinedAt: new Date(),
    };

    beforeEach(() => {
        chatService = new ChatService();
        jest.clearAllMocks();

        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.insert.mockReturnThis();
        mockDb.values.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
        mockDb.delete.mockReturnThis();
    });

    describe('getChatById', () => {
        it('should return chat when found', async () => {
            mockDb.limit.mockResolvedValue([mockChat]);

            const result = await chatService.getChatById(1);

            expect(result.id).toBe(1);
            expect(result.name).toBe('Test Chat');
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(chatService.getChatById(999)).rejects.toThrow('Chat not found');
        });
    });

    describe('getUserChats', () => {
        it('should return user chats', async () => {
            mockDb.where.mockResolvedValueOnce([{ chatId: 1 }]);
            mockDb.orderBy.mockResolvedValue([mockChat]);

            const result = await chatService.getUserChats(1);

            expect(result).toHaveLength(1);
        });

        it('should return empty array when no chats', async () => {
            mockDb.where.mockResolvedValue([]);

            const result = await chatService.getUserChats(1);

            expect(result).toHaveLength(0);
        });
    });

    describe('getProjectChats', () => {
        it('should return project chats', async () => {
            mockDb.orderBy.mockResolvedValue([mockChat]);

            const result = await chatService.getProjectChats(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getTeamChats', () => {
        it('should return team chats', async () => {
            mockDb.orderBy.mockResolvedValue([mockChat]);

            const result = await chatService.getTeamChats(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getChatMembers', () => {
        it('should return chat members', async () => {
            mockDb.orderBy.mockResolvedValue([mockMember]);

            const result = await chatService.getChatMembers(1);

            expect(result).toHaveLength(1);
            expect(result[0].role).toBe('admin');
        });
    });

    describe('isUserMember', () => {
        it('should return true when user is member', async () => {
            mockDb.limit.mockResolvedValue([mockMember]);

            const result = await chatService.isUserMember(1, 1);

            expect(result).toBe(true);
        });

        it('should return false when user is not member', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await chatService.isUserMember(1, 999);

            expect(result).toBe(false);
        });
    });

    describe('isUserAdmin', () => {
        it('should return true when user is admin', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockMember, role: 'admin' }]);

            const result = await chatService.isUserAdmin(1, 1);

            expect(result).toBe(true);
        });

        it('should return false when user is not admin', async () => {
            mockDb.limit.mockResolvedValue([]);

            const result = await chatService.isUserAdmin(1, 1);

            expect(result).toBe(false);
        });
    });

    describe('createChat', () => {
        it('should create chat and add creator as admin', async () => {
            mockDb.returning.mockResolvedValue([mockChat]);

            const result = await chatService.createChat({ name: 'New Chat', type: 'group' }, 1);

            expect(result.name).toBe('Test Chat');
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('addMember', () => {
        it('should add member to chat', async () => {
            mockDb.returning.mockResolvedValue([mockMember]);

            const result = await chatService.addMember(1, 2, 'member');

            expect(result.userId).toBe(1);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('removeMember', () => {
        it('should remove member when requester is admin', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockMember, role: 'admin' }]); // isUserAdmin
            mockDb.returning.mockResolvedValue([{ id: 1 }]);

            await expect(chatService.removeMember(1, 2, 1)).resolves.toBeUndefined();
        });

        it('should throw ForbiddenError when not admin', async () => {
            mockDb.limit.mockResolvedValue([]); // isUserAdmin returns false

            await expect(chatService.removeMember(1, 2, 3)).rejects.toThrow('Only admins can remove members');
        });

        it('should allow self-removal', async () => {
            mockDb.limit.mockResolvedValue([]);
            mockDb.returning.mockResolvedValue([{ id: 1 }]);

            await expect(chatService.removeMember(1, 2, 2)).resolves.toBeUndefined();
        });
    });

    describe('updateChat', () => {
        it('should update chat when user is admin', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockMember, role: 'admin' }]);
            mockDb.returning.mockResolvedValue([{ ...mockChat, name: 'Updated' }]);

            const result = await chatService.updateChat(1, 1, { name: 'Updated' });

            expect(result.name).toBe('Updated');
        });

        it('should throw ForbiddenError when not admin', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(chatService.updateChat(1, 1, { name: 'Updated' })).rejects.toThrow('Only admins can update chat');
        });
    });

    describe('deleteChat', () => {
        it('should delete chat when user is creator', async () => {
            mockDb.limit.mockResolvedValue([mockChat]);

            await chatService.deleteChat(1, 1);

            expect(mockDb.delete).toHaveBeenCalled();
        });

        it('should throw ForbiddenError when not creator', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockChat, createdBy: 999 }]);

            await expect(chatService.deleteChat(1, 1)).rejects.toThrow('Only chat creator can delete chat');
        });
    });

    describe('findOrCreateDirectChat', () => {
        it('should return existing direct chat', async () => {
            // Mock user1 chats
            mockDb.where
                .mockResolvedValueOnce([{ chatId: 1 }]) // user1Chats
                .mockResolvedValueOnce([{ chatId: 1 }]); // user2Chats
            mockDb.limit.mockResolvedValue([{ ...mockChat, type: 'direct' }]);

            const result = await chatService.findOrCreateDirectChat(1, 2);

            expect(result.type).toBe('direct');
        });

        it('should create new direct chat when no common chats', async () => {
            mockDb.where
                .mockResolvedValueOnce([{ chatId: 1 }])
                .mockResolvedValueOnce([{ chatId: 2 }]); // different chat ids
            mockDb.returning.mockResolvedValue([{ ...mockChat, type: 'direct' }]);

            const result = await chatService.findOrCreateDirectChat(1, 2);

            expect(result.type).toBe('direct');
        });

        it('should create new direct chat when common chats but no direct type', async () => {
            mockDb.where
                .mockResolvedValueOnce([{ chatId: 1 }])
                .mockResolvedValueOnce([{ chatId: 1 }]);
            mockDb.limit.mockResolvedValue([]); // no direct chat found
            mockDb.returning.mockResolvedValue([{ ...mockChat, type: 'direct' }]);

            const result = await chatService.findOrCreateDirectChat(1, 2);

            expect(result.type).toBe('direct');
        });

        it('should create new direct chat when no user chats exist', async () => {
            mockDb.where
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);
            mockDb.returning.mockResolvedValue([{ ...mockChat, type: 'direct' }]);

            const result = await chatService.findOrCreateDirectChat(1, 2);

            expect(result.type).toBe('direct');
        });
    });

    describe('removeMember - edge cases', () => {
        it('should throw NotFoundError when member not found', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockMember, role: 'admin' }]); // isUserAdmin
            mockDb.returning.mockResolvedValue([]); // no rows deleted

            await expect(chatService.removeMember(1, 999, 1)).rejects.toThrow('Member not found in chat');
        });
    });

    describe('updateChat - edge cases', () => {
        it('should throw NotFoundError when chat not found after update', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockMember, role: 'admin' }]); // isUserAdmin
            mockDb.returning.mockResolvedValue([]); // no rows updated

            await expect(chatService.updateChat(999, 1, { name: 'New' })).rejects.toThrow('Chat not found');
        });
    });
});
