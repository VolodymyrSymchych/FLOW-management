import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id);

  // Mock progress data
  return NextResponse.json({
    project_id: projectId,
    stages: [
      { name: 'Main Analysis', status: 'completed', progress: 100 },
      { name: 'Requirements Quality', status: 'completed', progress: 100 },
      { name: 'Risk Assessment', status: 'completed', progress: 100 },
      { name: 'Technical Complexity', status: 'completed', progress: 100 },
      { name: 'Scope Creep Detection', status: 'completed', progress: 100 },
      { name: 'Stakeholder Questions', status: 'completed', progress: 100 },
      { name: 'Assumption Extraction', status: 'completed', progress: 100 }
    ]
  });
}
