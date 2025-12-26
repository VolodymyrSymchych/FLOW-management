// Mock DB
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    offset: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
};

jest.mock('../../src/db', () => ({
    db: mockDb,
    notifications: {
        id: 'id',
        userId: 'userId',
        read: 'read',
        type: 'type',
        createdAt: 'createdAt',
    },
    notificationPreferences: {
        userId: 'userId',
    },
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((f, v) => ({ eq: f, v })),
    and: jest.fn((...a) => ({ and: a })),
    desc: jest.fn((f) => ({ desc: f })),
    sql: jest.fn((s, ...v) => ({ sql: s, v })),
}));

import { NotificationService } from '../../src/services/notification.service';

describe('NotificationService', () => {
    let notificationService: NotificationService;

    const mockNotification = {
        id: 1,
        userId: 1,
        title: 'Test Notification',
        content: 'Test message',
        type: 'task',
        read: false,
        data: null,
        createdAt: new Date(),
    };

    const mockPreferences = {
        id: 1,
        userId: 1,
        inAppEnabled: true,
        emailEnabled: true,
        taskNotifications: true,
        projectNotifications: true,
        teamNotifications: true,
        chatNotifications: true,
        paymentNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        notificationService = new NotificationService();
        jest.clearAllMocks();

        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.orderBy.mockReturnThis();
        mockDb.insert.mockReturnThis();
        mockDb.values.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
        mockDb.delete.mockReturnThis();
    });

    describe('createNotification', () => {
        it('should create notification', async () => {
            mockDb.returning.mockResolvedValue([mockNotification]);

            const result = await notificationService.createNotification({
                userId: 1,
                title: 'Test',
                content: 'Message',
                type: 'task',
            });

            expect(result.id).toBe(1);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('createBulkNotifications', () => {
        it('should create multiple notifications', async () => {
            mockDb.returning.mockResolvedValue([mockNotification, mockNotification]);

            const result = await notificationService.createBulkNotifications([
                { userId: 1, title: 'N1', content: 'M1', type: 'task' },
                { userId: 2, title: 'N2', content: 'M2', type: 'task' },
            ]);

            expect(result).toHaveLength(2);
        });

        it('should return empty array for empty input', async () => {
            const result = await notificationService.createBulkNotifications([]);

            expect(result).toHaveLength(0);
        });
    });

    describe('getUserNotifications', () => {
        it('should return user notifications', async () => {
            mockDb.orderBy.mockReturnValueOnce({
                limit: jest.fn().mockReturnValue({
                    offset: jest.fn().mockResolvedValue([mockNotification]),
                }),
            });

            const result = await notificationService.getUserNotifications(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getUnreadNotifications', () => {
        it('should return unread notifications', async () => {
            mockDb.orderBy.mockResolvedValue([mockNotification]);

            const result = await notificationService.getUnreadNotifications(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getNotificationById', () => {
        it('should return notification when found', async () => {
            mockDb.limit.mockResolvedValue([mockNotification]);

            const result = await notificationService.getNotificationById(1, 1);

            expect(result.id).toBe(1);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(notificationService.getNotificationById(999, 1)).rejects.toThrow('Notification not found');
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            mockDb.returning.mockResolvedValue([{ ...mockNotification, read: true }]);

            const result = await notificationService.markAsRead(1, 1);

            expect(result.read).toBe(true);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.returning.mockResolvedValue([]);

            await expect(notificationService.markAsRead(999, 1)).rejects.toThrow('Notification not found');
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            mockDb.returning.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const result = await notificationService.markAllAsRead(1);

            expect(result).toBe(2);
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', async () => {
            mockDb.returning.mockResolvedValue([{ id: 1 }]);

            await notificationService.deleteNotification(1, 1);

            expect(mockDb.delete).toHaveBeenCalled();
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.returning.mockResolvedValue([]);

            await expect(notificationService.deleteNotification(999, 1)).rejects.toThrow('Notification not found');
        });
    });

    describe('deleteReadNotifications', () => {
        it('should delete all read notifications', async () => {
            mockDb.returning.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const result = await notificationService.deleteReadNotifications(1);

            expect(result).toBe(2);
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            mockDb.where.mockResolvedValue([{ count: 5 }]);

            const result = await notificationService.getUnreadCount(1);

            expect(result).toBe(5);
        });

        it('should return 0 when no unread', async () => {
            mockDb.where.mockResolvedValue([null]);

            const result = await notificationService.getUnreadCount(1);

            expect(result).toBe(0);
        });
    });

    describe('getUserPreferences', () => {
        it('should return existing preferences', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.getUserPreferences(1);

            expect(result.userId).toBe(1);
        });

        it('should create default preferences if not exist', async () => {
            mockDb.limit.mockResolvedValue([]);
            mockDb.returning.mockResolvedValue([mockPreferences]);

            const result = await notificationService.getUserPreferences(1);

            expect(result.userId).toBe(1);
        });
    });

    describe('updateUserPreferences', () => {
        it('should update preferences', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);
            mockDb.returning.mockResolvedValue([{ ...mockPreferences, emailEnabled: false }]);

            const result = await notificationService.updateUserPreferences(1, { emailEnabled: false });

            expect(result.emailEnabled).toBe(false);
        });
    });

    describe('shouldSendNotification', () => {
        it('should return true when enabled', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.shouldSendNotification(1, 'task');

            expect(result).toBe(true);
        });

        it('should return false when inApp disabled', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockPreferences, inAppEnabled: false }]);

            const result = await notificationService.shouldSendNotification(1, 'task');

            expect(result).toBe(false);
        });

        it('should check specific notification type - project', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockPreferences, projectNotifications: false }]);

            const result = await notificationService.shouldSendNotification(1, 'project');

            expect(result).toBe(false);
        });

        it('should check specific notification type - team', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.shouldSendNotification(1, 'team');

            expect(result).toBe(true);
        });

        it('should check specific notification type - chat', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.shouldSendNotification(1, 'chat');

            expect(result).toBe(true);
        });

        it('should check specific notification type - payment', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.shouldSendNotification(1, 'payment');

            expect(result).toBe(true);
        });

        it('should return true for unknown types', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);

            const result = await notificationService.shouldSendNotification(1, 'unknown');

            expect(result).toBe(true);
        });
    });

    describe('sendNotification', () => {
        it('should send notification when allowed', async () => {
            mockDb.limit.mockResolvedValue([mockPreferences]);
            mockDb.returning.mockResolvedValue([mockNotification]);

            const result = await notificationService.sendNotification({
                userId: 1,
                title: 'Test',
                content: 'Message',
                type: 'task',
            });

            expect(result).not.toBeNull();
        });

        it('should return null when not allowed', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockPreferences, taskNotifications: false }]);

            const result = await notificationService.sendNotification({
                userId: 1,
                title: 'Test',
                content: 'Message',
                type: 'task',
            });

            expect(result).toBeNull();
        });
    });
});
