import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const templates = await storage.getProjectTemplates(category);

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching project templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, category, templateData, isPublic } = data;

    if (!name || !category || !templateData) {
      return NextResponse.json(
        { error: 'Name, category, and templateData are required' },
        { status: 400 }
      );
    }

    const template = await storage.createProjectTemplate({
      name,
      description: description || null,
      category,
      templateData: JSON.stringify(templateData),
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: session.userId,
      usageCount: 0,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project template:', error);
    return NextResponse.json(
      { error: 'Failed to create project template' },
      { status: 500 }
    );
  }
}

