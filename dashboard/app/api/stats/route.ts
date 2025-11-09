import { NextResponse } from 'next/server';
import { storage } from '../../../../server/storage';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all projects for the user
    const allProjects = await storage.getUserProjects(session.userId);
    
    // Current month stats
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Last month stats
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month projects
    const currentMonthProjects = allProjects.filter(p => {
      const createdAt = new Date(p.createdAt);
      return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
    });

    // Last month projects
    const lastMonthProjects = allProjects.filter(p => {
      const createdAt = new Date(p.createdAt);
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
    });

    // Calculate current stats
    const total_projects = allProjects.length;
    const in_progress = allProjects.filter(p => p.status === 'in_progress').length;
    const completed = allProjects.filter(p => p.status === 'completed').length;
    
    // Completion rate: (completed / total) * 100
    const completion_rate = total_projects > 0 
      ? Math.round((completed / total_projects) * 100) 
      : 0;

    // Calculate trends (percentage change from last month)
    const calculateTrend = (current: number, last: number): number => {
      if (last === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - last) / last) * 100);
    };

    const projectsInProgressTrend = calculateTrend(
      currentMonthProjects.filter(p => p.status === 'in_progress').length,
      lastMonthProjects.filter(p => p.status === 'in_progress').length
    );

    const totalProjectsTrend = calculateTrend(
      currentMonthProjects.length,
      lastMonthProjects.length
    );

    return NextResponse.json({
      projects_in_progress: in_progress,
      total_projects: total_projects,
      completion_rate: completion_rate,
      projects_completed: completed,
      trends: {
        projects_in_progress: {
          value: Math.abs(projectsInProgressTrend),
          isPositive: projectsInProgressTrend >= 0,
        },
        total_projects: {
          value: Math.abs(totalProjectsTrend),
          isPositive: totalProjectsTrend >= 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
