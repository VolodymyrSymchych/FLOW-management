import { NextResponse } from 'next/server';

/** Standard API error responses */
export const apiResponses = {
  unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  forbidden: (message = 'Forbidden') => NextResponse.json({ error: message }, { status: 403 }),
  notFound: (message = 'Not found') => NextResponse.json({ error: message }, { status: 404 }),
  badRequest: (message: string) => NextResponse.json({ error: message }, { status: 400 }),
  serverError: (message = 'Internal server error') =>
    NextResponse.json({ error: message }, { status: 500 }),
};

/** Parse numeric ID from route param; returns null if invalid */
export function parseNumericId(
  idStr: string,
  opts?: { min?: number; allowZero?: boolean }
): number | null {
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return null;
  if (opts?.min !== undefined && id < opts.min) return null;
  if (!opts?.allowZero && id <= 0) return null;
  return id;
}
