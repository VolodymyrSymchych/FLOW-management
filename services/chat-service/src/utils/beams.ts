import PushNotifications from '@pusher/push-notifications-server';
import { config } from '../config';
import { logger } from '@project-scope-analyzer/shared';

let beamsInstance: PushNotifications | null = null;

export function getBeams(): PushNotifications {
  if (!beamsInstance) {
    if (!config.beams.instanceId || !config.beams.secretKey) {
      logger.warn('Pusher Beams credentials not configured. Push notifications will not work.');
      // Return a mock instance for development
      beamsInstance = {
        publishToUsers: async () => {
          logger.debug('Mock Beams publishToUsers called (Beams not configured)');
          return { publishId: 'mock' };
        },
        publishToInterests: async () => {
          logger.debug('Mock Beams publishToInterests called (Beams not configured)');
          return { publishId: 'mock' };
        },
      } as any;
      return beamsInstance;
    }

    beamsInstance = new PushNotifications({
      instanceId: config.beams.instanceId,
      secretKey: config.beams.secretKey,
    });

    logger.info('Pusher Beams initialized', { instanceId: config.beams.instanceId });
  }

  return beamsInstance;
}

// Send push notification to specific users
export async function sendPushToUsers(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    deep_link?: string;
  }
): Promise<void> {
  try {
    const beams = getBeams();

    await beams.publishToUsers(userIds, {
      web: {
        notification: {
          title: notification.title,
          body: notification.body,
          deep_link: notification.deep_link,
          icon: '/icon.png', // Your app icon
        },
        data: notification.data,
      },
      fcm: {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      },
      apns: {
        aps: {
          alert: {
            title: notification.title,
            body: notification.body,
          },
          sound: 'default',
        },
        data: notification.data,
      },
    });

    logger.info('Push notification sent', { userIds, title: notification.title });
  } catch (error) {
    logger.error('Failed to send push notification', { error, userIds });
    // Don't throw - push notifications are not critical
  }
}

// Send push notification to interests (topics)
export async function sendPushToInterest(
  interest: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    deep_link?: string;
  }
): Promise<void> {
  try {
    const beams = getBeams();

    await beams.publishToInterests([interest], {
      web: {
        notification: {
          title: notification.title,
          body: notification.body,
          deep_link: notification.deep_link,
          icon: '/icon.png',
        },
        data: notification.data,
      },
      fcm: {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      },
      apns: {
        aps: {
          alert: {
            title: notification.title,
            body: notification.body,
          },
          sound: 'default',
        },
        data: notification.data,
      },
    });

    logger.info('Push notification sent to interest', { interest, title: notification.title });
  } catch (error) {
    logger.error('Failed to send push notification to interest', { error, interest });
  }
}

// Helper to get user ID as string for Beams
export function getUserBeamsId(userId: number): string {
  return `user-${userId}`;
}

// Helper to get chat interest name
export function getChatInterest(chatId: number): string {
  return `chat-${chatId}`;
}
