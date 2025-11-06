import { NextResponse } from 'next/server';
import { projects, analyses } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id);
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const analysis = analyses[projectId] || {
    results: {},
    report: 'Analysis not available',
    metadata: {}
  };

  return NextResponse.json({
    project,
    analysis
  });
}
