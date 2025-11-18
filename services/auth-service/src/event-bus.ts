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
 */
export async function getEventBus(): Promise<IEventBus | null> {
  // If already connected, return immediately
  if (eventBusInstance) {
    return eventBusInstance;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    try {
      return await connectionPromise;
    } catch (error) {
      logger.error('Event bus connection failed', { error });
      return null;
    }
  }

  // Start connection (non-blocking for serverless)
  connectionPromise = (async () => {
    try {
      const bus = createEventBus(config.service.name, config.eventBus.type);
      await bus.connect();
      eventBusInstance = bus;
      logger.info('Event bus connected', { service: config.service.name, type: config.eventBus.type });
      return bus;
    } catch (error) {
      logger.error('Failed to connect event bus', { error });
      connectionPromise = null;
      throw error;
    }
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    return null;
  }
}

/**
 * Publish event (non-blocking, handles errors gracefully)
 */
export async function publishEvent(event: AppEvent): Promise<void> {
  try {
    const bus = await getEventBus();
    if (bus) {
      await bus.publish(event);
    }
  } catch (error) {
    // Don't fail the request if event publishing fails
    logger.error('Failed to publish event', { error, event });
  }
}

