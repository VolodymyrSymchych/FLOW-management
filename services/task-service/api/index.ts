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
  const app = getApp();
  
  // Convert Vercel request/response to Express-compatible format
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}

