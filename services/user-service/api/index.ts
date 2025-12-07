/**
 * Vercel Serverless Function adapter for Express.js
 * This file adapts the Express app to work with Vercel's serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Request, Response } from 'express';
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
    const app = getApp();

    // Convert Vercel request/response to Express-compatible format
    return new Promise<void>((resolve, reject) => {
      app(req as unknown as Request, res as unknown as Response, (err?: unknown) => {
        if (err) {
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Internal Server Error',
              message: err instanceof Error ? err.message : 'Unknown error',
            });
          }
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    throw error;
  }
}

