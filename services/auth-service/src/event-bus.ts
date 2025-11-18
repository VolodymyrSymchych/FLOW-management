/**
 * Lazy-loaded event bus for serverless environments
 * This prevents blocking cold starts by deferring connection until needed
 */

import { createEventBus, type IEventBus, type AppEvent } from '@project-scope-analyzer/shared';
import { config } from './config';
import { logger } from '@project-scope-analyzer/shared';

let eventBusInstance: IEventBus | null = null;
let connectionPromise: Promise<IEventBus> | null = null;

/**
 * Get or create event bus instance (lazy loading)
 * Connection is deferred until first use
 * Returns null if connection fails or times out (non-blocking)
 */
export async function getEventBus(): Promise<IEventBus | null> {
  // If already connected, return immediately
  if (eventBusInstance) {
    return eventBusInstance;
  }

  // If connection is in progress, wait for it (with timeout)
  if (connectionPromise) {
    try {
      return await Promise.race([
        connectionPromise,
        new Promise<IEventBus | null>((resolve) => {
          setTimeout(() => {
            logger.warn('Event bus connection timeout, returning null');
            resolve(null);
          }, 5000); // 5 second timeout
        }),
      ]);
    } catch (error) {
      logger.error('Event bus connection failed', { error });
      return null;
    }
  }

  // Start connection (non-blocking for serverless)
  connectionPromise = (async () => {
    try {
      const bus = createEventBus(config.service.name, config.eventBus.type);
      // Add timeout to connection
      await Promise.race([
        bus.connect(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        }),
      ]);
      eventBusInstance = bus;
      logger.info('Event bus connected', { service: config.service.name, type: config.eventBus.type });
      return bus;
    } catch (error) {
      logger.error('Failed to connect event bus', { error });
      connectionPromise = null;
      throw error;
    }
  })();

  // Don't wait for connection - return null immediately
  // Connection will happen in background, and next call will get the connected instance
  // This ensures requests are never blocked by event bus connection
  return null;
}

/**
 * Publish event (non-blocking, handles errors gracefully)
 * This function fires and forgets - it doesn't wait for the event to be published
 */
export function publishEvent(event: AppEvent): void {
  // Fire and forget - don't block the request
  getEventBus()
    .then((bus) => {
      if (bus) {
        return bus.publish(event);
      }
    })
    .catch((error) => {
      // Don't fail the request if event publishing fails
      logger.error('Failed to publish event', { error, event });
    });
}

