import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const includeAttendance = searchParams.get('include_attendance') === 'true';

    // Optimized: Get members with user details in one query using JOIN
    const membersWithUsers = await storage.getTeamMembersWithUsers(teamId);
    
    // Format user data
    const formattedMembers = membersWithUsers.map(member => ({
      ...member,
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.fullName || member.user.username,
        username: member.user.username,
        fullName: member.user.fullName,
        avatarUrl: member.user.avatarUrl,
      },
    }));

    // If attendance is requested, fetch it for all members at once
    if (includeAttendance) {
      const userIds = formattedMembers.map(m => m.userId);
      const allTimeEntries = await storage.getTimeEntriesByTeam(teamId);
      
      // Group entries by userId
      const entriesByUserId = new Map<number, typeof allTimeEntries>();
      allTimeEntries.forEach(entry => {
        if (!entriesByUserId.has(entry.userId)) {
          entriesByUserId.set(entry.userId, []);
        }
        entriesByUserId.get(entry.userId)!.push(entry);
      });

      // Calculate attendance stats for each member
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const membersWithAttendance = formattedMembers.map(member => {
        if (!member.user) return member;
        
        const entries = entriesByUserId.get(member.userId) || [];
        
        const totalHours = entries.reduce((sum, entry) => {
          return sum + (entry.duration || 0);
        }, 0) / 60; // Convert minutes to hours

        const todayHours = entries
          .filter(entry => new Date(entry.clockIn) >= today)
          .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;

        const weekHours = entries
          .filter(entry => new Date(entry.clockIn) >= weekAgo)
          .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;

        return {
          ...member,
          attendance: {
            totalHours: Math.round(totalHours * 10) / 10,
            todayHours: Math.round(todayHours * 10) / 10,
            weekHours: Math.round(weekHours * 10) / 10,
          },
        };
      });

      return NextResponse.json({ members: membersWithAttendance });
    }

    return NextResponse.json({ members: formattedMembers });
  } catch (error: any) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get team members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const { userEmail, role } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const userToAdd = await storage.getUserByEmail(userEmail);
    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const member = await storage.addTeamMember({
      teamId,
      userId: userToAdd.id,
      role: role || 'member',
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error('Add team member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add team member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await storage.removeTeamMember(teamId, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove team member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
