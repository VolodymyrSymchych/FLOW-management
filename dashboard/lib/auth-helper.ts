import { cookies } from 'next/headers';
import { getSession } from './auth';

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value || null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Unauthorized');
  }
  return { session, token };
}

