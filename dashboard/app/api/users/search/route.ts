import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';
import { db } from '@/server/db';
import { users } from '../../../../../shared/schema';
import { eq, or, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search by email or username (partial match using SQL LIKE)
    const searchTerm = `%${query.trim().toLowerCase()}%`;
    
    const matchingUsers = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          sql`${users.id} != ${session.userId}`,
          or(
            sql`LOWER(${users.username}) LIKE ${searchTerm}`,
            sql`LOWER(${users.email}) LIKE ${searchTerm}`,
            sql`LOWER(${users.fullName}) LIKE ${searchTerm}`
          )
        )
      )
      .limit(10);

    return NextResponse.json({ users: matchingUsers });
  } catch (error: any) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search users' },
      { status: 500 }
    );
  }
}

