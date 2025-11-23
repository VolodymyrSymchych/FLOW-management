/**
 * Vercel Serverless Function adapter for Express.js
 * This file adapts the Express app to work with Vercel's serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

// Create Express app instance (singleton pattern for serverless)
let appInstance: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set timeout headers
    res.setHeader('X-Vercel-Timeout', '60');

    const app = getApp();

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout after 55 seconds'));
      }, 55000); // 55s timeout (before Vercel's 60s)
    });

    // Race between request and timeout
    const requestPromise = new Promise((resolve, reject) => {
      app(req as any, res as any, (err?: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });

    await Promise.race([requestPromise, timeoutPromise]);
  } catch (error) {
    console.error('Handler error:', error);

    // Send error response if not already sent
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Service temporarily unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
