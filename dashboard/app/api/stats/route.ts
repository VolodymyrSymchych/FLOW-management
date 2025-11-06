import { NextResponse } from 'next/server';
import { projects } from '../data';

export async function GET() {
  const total_projects = projects.length;
  const in_progress = projects.filter(p => p.status === 'in_progress').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  const scores = projects.filter(p => p.score).map(p => p.score);
  const avg_score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return NextResponse.json({
    projects_in_progress: in_progress,
    total_projects: total_projects,
    completion_rate: avg_score,
    projects_completed: completed
  });
}
