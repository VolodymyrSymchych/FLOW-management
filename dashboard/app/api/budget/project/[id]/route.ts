import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);
    const project = await storage.getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!project.budget) {
      return NextResponse.json({ 
        metrics: {
          spent: 0,
          utilizationPercentage: 0,
          remaining: 0,
          forecastSpending: 0,
          daysRemaining: 0,
        }
      });
    }

    // Get all expenses for this project
    const expenses = await storage.getExpenses(projectId);
    const spent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    const utilizationPercentage = (spent / project.budget) * 100;
    const remaining = Math.max(0, project.budget - spent);

    // Calculate forecast based on project timeline
    let daysRemaining = 0;
    let forecastSpending = 0;
    
    if (project.startDate && project.endDate) {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const today = new Date();
      
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, totalDays - daysElapsed);
      
      if (daysElapsed > 0) {
        const averageDailySpending = spent / daysElapsed;
        forecastSpending = averageDailySpending * 30; // 30-day forecast
      }
    } else {
      // If no dates, use creation date
      const daysSinceCreation = Math.max(1, Math.floor(
        (Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const averageDailySpending = spent / daysSinceCreation;
      forecastSpending = averageDailySpending * 30;
    }

    return NextResponse.json({
      metrics: {
        spent,
        utilizationPercentage,
        remaining,
        forecastSpending,
        daysRemaining,
      }
    });
  } catch (error: any) {
    console.error('Error fetching project budget metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch project budget metrics' }, { status: 500 });
  }
}

