import { NextRequest, NextResponse } from 'next/server';
import { tasksApi } from '@/lib/tasks-api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const subtask = await tasksApi.addSubtask(taskId, title);

    if (!subtask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ subtask }, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const { subtask_id } = await request.json();

    if (!subtask_id) {
      return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 });
    }

    const success = await tasksApi.toggleSubtask(taskId, subtask_id);

    if (!success) {
      return NextResponse.json({ error: 'Task or subtask not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling subtask:', error);
    return NextResponse.json({ error: 'Failed to toggle subtask' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const subtaskId = searchParams.get('subtask_id');

    if (!subtaskId) {
      return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 });
    }

    const success = await tasksApi.deleteSubtask(taskId, parseInt(subtaskId));

    if (!success) {
      return NextResponse.json({ error: 'Task or subtask not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
