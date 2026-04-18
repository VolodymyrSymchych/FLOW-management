import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';
import { databaseConnections, recordDatabaseQuery } from '../utils/metrics';

export interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class DatabaseConnection {
  private pool: Pool;
  private serviceName: string;

  constructor(config: DatabaseConfig, serviceName: string = 'unknown') {
    this.serviceName = serviceName;
    this.pool = new Pool({
      ...config,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', { error: err, service: this.serviceName });
    });

    this.pool.on('connect', () => {
      databaseConnections.inc({ state: 'active' });
    });

    this.pool.on('remove', () => {
      databaseConnections.dec({ state: 'active' });
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    const operation = text.trim().split(' ')[0].toLowerCase();
    const table = this.extractTableName(text);

    try {
      const result = await this.pool.query(text, params);
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery(operation, table, duration);

      return result.rows as T[];
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      recordDatabaseQuery(operation, table, duration);
      logger.error('Database query error', {
        error,
        query: text,
        params,
        service: this.serviceName,
      });
      throw error;
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  private extractTableName(query: string): string {
    const match = query.match(/(?:FROM|INTO|UPDATE|DELETE\s+FROM)\s+["`]?(\w+)["`]?/i);
    return match ? match[1] : 'unknown';
  }
}

// Factory function to create database connection from environment variables
export function createDatabaseConnection(serviceName: string): DatabaseConnection {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  };

  if (!config.database || !config.user || !config.password) {
    throw new Error(`Missing database configuration for service: ${serviceName}`);
  }

  return new DatabaseConnection(config, serviceName);
}

