import { NextRequest, NextResponse } from 'next/server';
import { tasksApi, CreateTaskRequest } from '@/lib/tasks-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    const tasks = await tasksApi.getTasks(projectId ? parseInt(projectId) : undefined);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateTaskRequest = await request.json();
    const task = await tasksApi.createTask(data);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
