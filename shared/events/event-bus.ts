import Redis from 'ioredis';
import * as amqp from 'amqplib';
import { AppEvent, EventEnvelope, EventMetadata } from './events';
import { logger } from '../utils/logger';
import { recordEventPublished, recordEventProcessed } from '../utils/metrics';

export type EventBusType = 'redis' | 'rabbitmq';

export interface EventBusConfig {
  type: EventBusType;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  rabbitmq?: {
    url: string;
    exchange?: string;
  };
  serviceName: string;
}

export interface EventHandler<T extends AppEvent = AppEvent> {
  (event: T, metadata: EventMetadata): Promise<void>;
}

export interface IEventBus {
  connect(): Promise<void>;
  publish<T extends AppEvent>(event: T, metadata?: Partial<EventMetadata>): Promise<void>;
  subscribe<T extends AppEvent>(eventType: string, handler: EventHandler<T>): () => void;
  disconnect(): Promise<void>;
}

class EventBusImpl implements IEventBus {
  private redis?: Redis; // For subscribing
  private redisPublisher?: Redis; // Separate client for publishing
  private rabbitmq?: {
    connection: amqp.Connection;
    channel: amqp.Channel;
    exchange: string;
  };
  private config: EventBusConfig;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected: boolean = false;

  constructor(config: EventBusConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      if (this.config.type === 'redis') {
        await this.connectRedis();
      } else if (this.config.type === 'rabbitmq') {
        await this.connectRabbitMQ();
      }
      this.isConnected = true;
      logger.info('Event bus connected', { type: this.config.type, service: this.config.serviceName });
    } catch (error) {
      logger.error('Failed to connect event bus', { error, service: this.config.serviceName });
      throw error;
    }
  }

  private async connectRedis(): Promise<void> {
    const { host, port, password } = this.config.redis || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    };

    const redisConfig = {
      host,
      port,
      password,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Create separate clients for subscribing and publishing
    // Subscriber client (can only use subscriber commands)
    this.redis = new Redis(redisConfig);
    this.redis.on('error', (error) => {
      logger.error('Redis subscriber connection error', { error, service: this.config.serviceName });
    });

    // Publisher client (can use all commands including publish)
    this.redisPublisher = new Redis(redisConfig);
    this.redisPublisher.on('error', (error) => {
      logger.error('Redis publisher connection error', { error, service: this.config.serviceName });
    });

    // Subscribe to all event types using subscriber client
    this.redis.psubscribe('event:*');
    this.redis.on('pmessage', (pattern, channel, message) => {
      this.handleRedisMessage(channel, message);
    });
  }

  private async connectRabbitMQ(): Promise<void> {
    const url = this.config.rabbitmq?.url || process.env.RABBITMQ_URL || 'amqp://admin:admin_password@localhost:5672';
    const exchange = this.config.rabbitmq?.exchange || 'events';

    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, 'topic', { durable: true });

    this.rabbitmq = { 
      connection: connection as any, 
      channel: channel as any, 
      exchange 
    };

    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error', { error, service: this.config.serviceName });
    });
  }

  async publish<T extends AppEvent>(event: T, metadata?: Partial<EventMetadata>): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Event bus is not connected');
    }

    const eventMetadata: EventMetadata = {
      eventId: this.generateEventId(),
      correlationId: metadata?.correlationId,
      causationId: metadata?.causationId,
      timestamp: new Date(),
      source: this.config.serviceName,
      version: '1.0',
      ...metadata,
    };

    const envelope: EventEnvelope<T> = {
      event,
      metadata: eventMetadata,
    };

    try {
      if (this.config.type === 'redis') {
        await this.publishRedis(event.type, envelope);
      } else if (this.config.type === 'rabbitmq') {
        await this.publishRabbitMQ(event.type, envelope);
      }

      recordEventPublished(event.type);
      logger.debug('Event published', {
        eventType: event.type,
        eventId: eventMetadata.eventId,
        service: this.config.serviceName,
      });
    } catch (error) {
      logger.error('Failed to publish event', {
        error,
        eventType: event.type,
        service: this.config.serviceName,
      });
      throw error;
    }
  }

  private async publishRedis(eventType: string, envelope: EventEnvelope<AppEvent>): Promise<void> {
    if (!this.redisPublisher) {
      throw new Error('Redis publisher is not connected');
    }

    const channel = `event:${eventType}`;
    await this.redisPublisher.publish(channel, JSON.stringify(envelope));
  }

  private async publishRabbitMQ(eventType: string, envelope: EventEnvelope<AppEvent>): Promise<void> {
    if (!this.rabbitmq) {
      throw new Error('RabbitMQ is not connected');
    }

    const { channel, exchange } = this.rabbitmq;
    const routingKey = eventType;
    const message = Buffer.from(JSON.stringify(envelope));

    await channel.publish(exchange, routingKey, message, { persistent: true });
  }

  subscribe<T extends AppEvent>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    // Subscribe to RabbitMQ queue if using RabbitMQ
    if (this.config.type === 'rabbitmq' && this.rabbitmq) {
      this.subscribeRabbitMQ(eventType);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler as EventHandler);
      }
    };
  }

  private async subscribeRabbitMQ(eventType: string): Promise<void> {
    if (!this.rabbitmq) {
      return;
    }

    const { channel, exchange } = this.rabbitmq;
    const queue = `${this.config.serviceName}.${eventType}`;
    const routingKey = eventType.replace('.', '.');

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, async (msg) => {
      if (!msg) {
        return;
      }

      try {
        const envelope: EventEnvelope<AppEvent> = JSON.parse(msg.content.toString());
        await this.handleMessage(envelope);
        channel.ack(msg);
      } catch (error) {
        logger.error('Failed to process RabbitMQ message', { error, eventType });
        channel.nack(msg, false, false);
      }
    });
  }

  private async handleRedisMessage(channel: string, message: string): Promise<void> {
    try {
      const envelope: EventEnvelope<AppEvent> = JSON.parse(message);
      await this.handleMessage(envelope);
    } catch (error) {
      logger.error('Failed to handle Redis message', { error, channel });
    }
  }

  private async handleMessage(envelope: EventEnvelope<AppEvent>): Promise<void> {
    const { event, metadata } = envelope;
    const handlers = this.handlers.get(event.type);

    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event, metadata);
        recordEventProcessed(event.type, 'success');
      } catch (error) {
        recordEventProcessed(event.type, 'error');
        logger.error('Event handler error', {
          error,
          eventType: event.type,
          eventId: metadata.eventId,
          service: this.config.serviceName,
        });
      }
    });

    await Promise.allSettled(promises);
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = undefined;
    }

    if (this.redisPublisher) {
      await this.redisPublisher.quit();
      this.redisPublisher = undefined;
    }

    if (this.rabbitmq) {
      try {
        await this.rabbitmq.channel.close();
        await (this.rabbitmq.connection as any).close();
      } catch (error) {
        logger.error('Error closing RabbitMQ connection', { error });
      }
      this.rabbitmq = undefined;
    }

    this.isConnected = false;
    logger.info('Event bus disconnected', { service: this.config.serviceName });
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function
export function createEventBus(serviceName: string, type: EventBusType = 'redis'): IEventBus {
  const config: EventBusConfig = {
    type,
    serviceName,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin_password@localhost:5672',
      exchange: process.env.RABBITMQ_EXCHANGE || 'events',
    },
  };

  return new EventBusImpl(config);
}

// Export type alias
export type EventBus = IEventBus;

