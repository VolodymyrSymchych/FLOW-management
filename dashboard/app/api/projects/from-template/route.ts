import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectService } from '@/lib/project-service';
import { storage } from '../../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { templateId, ...projectData } = data;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Try project-service first
    const result = await projectService.createFromTemplate(parseInt(templateId), projectData);

    if (result.project) {
      return NextResponse.json({ project: result.project }, { status: 201 });
    }

    // Fallback to local storage
    if (result.error) {
      console.warn('Project service error, falling back to local storage:', result.error);
    }

    // Get template
    const template = await storage.getProjectTemplate(parseInt(templateId));
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Parse template data
    const templateData = JSON.parse(template.templateData);

    // Merge template data with provided project data (provided data takes precedence)
    const mergedData = {
      ...templateData,
      ...projectData,
      userId: session.userId,
    };

    // Create project from template
    const project = await storage.createProject(mergedData);

    // Increment template usage
    await storage.incrementTemplateUsage(template.id);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project from template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project from template' },
      { status: 500 }
    );
  }
}

