import { cookies } from 'next/headers';
import { getSession } from './auth';

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value || null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  const token = await getAuthToken();
  if (!token) {
    throw new UnauthorizedError();
  }
  return { session, token };
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}
