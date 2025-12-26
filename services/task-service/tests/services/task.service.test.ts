// Mock database
const mockDbInstance = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn(),
    innerJoin: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};

jest.mock('../../src/db', () => ({
    db: mockDbInstance,
    tasks: {
        id: 'id',
        userId: 'userId',
        projectId: 'projectId',
        parentId: 'parentId',
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
    },
    projects: {
        id: 'id',
        teamId: 'teamId',
        deletedAt: 'deletedAt',
    },
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ field, value })),
    and: jest.fn((...conditions) => ({ type: 'and', conditions })),
    or: jest.fn((...conditions) => ({ type: 'or', conditions })),
    isNull: jest.fn((field) => ({ isNull: field })),
    desc: jest.fn((field) => ({ desc: field })),
    inArray: jest.fn((field, arr) => ({ inArray: field, arr })),
    sql: jest.fn((strings, ...values) => ({ sql: strings.join('?'), values })),
}));

import { TaskService, Task, CreateTaskInput } from '../../src/services/task.service';

describe('TaskService', () => {
    let taskService: TaskService;

    const mockTaskData = {
        id: 1,
        projectId: 1,
        userId: 1,
        parentId: null,
        title: 'Test Task',
        description: 'Test description',
        assignee: 'user1',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        endDate: null,
        status: 'todo',
        priority: 'medium',
        dependsOn: null,
        progress: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
    };

    beforeEach(() => {
        taskService = new TaskService();
        jest.clearAllMocks();

        mockDbInstance.select.mockReturnThis();
        mockDbInstance.from.mockReturnThis();
        mockDbInstance.where.mockReturnThis();
        mockDbInstance.innerJoin.mockReturnThis();
        mockDbInstance.insert.mockReturnThis();
        mockDbInstance.values.mockReturnThis();
        mockDbInstance.update.mockReturnThis();
        mockDbInstance.set.mockReturnThis();
    });

    describe('getUserTasks', () => {
        it('should return user tasks', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTaskData]);

            const result = await taskService.getUserTasks(1);

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Test Task');
        });

        it('should filter by projectId', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTaskData]);

            const result = await taskService.getUserTasks(1, 1);

            expect(result).toHaveLength(1);
        });

        it('should return empty array', async () => {
            mockDbInstance.orderBy.mockResolvedValue([]);

            const result = await taskService.getUserTasks(1);

            expect(result).toHaveLength(0);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getUserTasks(1)).rejects.toThrow();
        });
    });

    describe('getTasksByTeam', () => {
        it('should return team tasks', async () => {
            mockDbInstance.orderBy.mockResolvedValue([{ task: mockTaskData }]);

            const result = await taskService.getTasksByTeam(1, 1);

            expect(result).toHaveLength(1);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getTasksByTeam(1, 1)).rejects.toThrow();
        });
    });

    describe('getTaskById', () => {
        it('should return task when found', async () => {
            mockDbInstance.where.mockResolvedValue([mockTaskData]);

            const result = await taskService.getTaskById(1);

            expect(result?.id).toBe(1);
        });

        it('should return null when not found', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            const result = await taskService.getTaskById(999);

            expect(result).toBeNull();
        });

        it('should filter by userId', async () => {
            mockDbInstance.where.mockResolvedValue([mockTaskData]);

            const result = await taskService.getTaskById(1, 1);

            expect(result).not.toBeNull();
        });

        it('should throw error on failure', async () => {
            mockDbInstance.where.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getTaskById(1)).rejects.toThrow();
        });
    });

    describe('getSubtasks', () => {
        it('should return subtasks', async () => {
            mockDbInstance.orderBy.mockResolvedValue([{ ...mockTaskData, parentId: 1 }]);

            const result = await taskService.getSubtasks(1);

            expect(result).toHaveLength(1);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getSubtasks(1)).rejects.toThrow();
        });
    });

    describe('createTask', () => {
        it('should create task successfully', async () => {
            mockDbInstance.returning.mockResolvedValue([mockTaskData]);

            const input: CreateTaskInput = { title: 'New Task' };
            const result = await taskService.createTask(1, input);

            expect(result.title).toBe('Test Task');
        });

        it('should create task with all fields', async () => {
            mockDbInstance.returning.mockResolvedValue([mockTaskData]);

            const input: CreateTaskInput = {
                title: 'Full Task',
                description: 'Description',
                projectId: 1,
                assignee: 'user1',
                startDate: new Date(),
                dueDate: new Date(),
                endDate: new Date(),
                status: 'in_progress',
                priority: 'high',
                dependsOn: [1, 2],
                progress: 50,
                parentId: 1,
            };
            const result = await taskService.createTask(1, input);

            expect(result).toBeDefined();
        });

        it('should throw error on failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(taskService.createTask(1, { title: 'Test' })).rejects.toThrow();
        });
    });

    describe('updateTask', () => {
        it('should update task successfully', async () => {
            mockDbInstance.returning.mockResolvedValue([{ ...mockTaskData, title: 'Updated' }]);

            const result = await taskService.updateTask(1, 1, { title: 'Updated' });

            expect(result?.title).toBe('Updated');
        });

        it('should update all fields', async () => {
            mockDbInstance.returning.mockResolvedValue([mockTaskData]);

            const result = await taskService.updateTask(1, 1, {
                title: 'Updated',
                description: 'Updated desc',
                projectId: 2,
                assignee: 'user2',
                startDate: new Date(),
                dueDate: new Date(),
                endDate: new Date(),
                status: 'done',
                priority: 'low',
                dependsOn: [3],
                progress: 100,
                parentId: 2,
            });

            expect(result).toBeDefined();
        });

        it('should return null when not found', async () => {
            mockDbInstance.returning.mockResolvedValue([]);

            const result = await taskService.updateTask(999, 1, { title: 'Test' });

            expect(result).toBeNull();
        });

        it('should throw error on failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(taskService.updateTask(1, 1, { title: 'Test' })).rejects.toThrow();
        });
    });

    describe('deleteTask', () => {
        it('should soft delete task', async () => {
            mockDbInstance.returning.mockResolvedValue([{ ...mockTaskData, deletedAt: new Date() }]);

            const result = await taskService.deleteTask(1, 1);

            expect(result).toBe(true);
        });

        it('should return false when not found', async () => {
            mockDbInstance.returning.mockResolvedValue([]);

            const result = await taskService.deleteTask(999, 1);

            expect(result).toBe(false);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(taskService.deleteTask(1, 1)).rejects.toThrow();
        });
    });

    describe('getDependencies', () => {
        it('should return empty array when no dependencies', async () => {
            mockDbInstance.where.mockResolvedValue([mockTaskData]);

            const result = await taskService.getDependencies(1);

            expect(result).toHaveLength(0);
        });

        it('should return empty array when task not found', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            const result = await taskService.getDependencies(999);

            expect(result).toHaveLength(0);
        });

        it('should return dependencies', async () => {
            const taskWithDeps = { ...mockTaskData, dependsOn: '[2, 3]' };
            mockDbInstance.where
                .mockResolvedValueOnce([taskWithDeps])
                .mockResolvedValueOnce([mockTaskData, { ...mockTaskData, id: 2 }]);

            const result = await taskService.getDependencies(1);

            expect(result).toHaveLength(2);
        });

        it('should return empty array for empty dependsOn array', async () => {
            const taskWithEmptyDeps = { ...mockTaskData, dependsOn: '[]' };
            mockDbInstance.where.mockResolvedValue([taskWithEmptyDeps]);

            const result = await taskService.getDependencies(1);

            expect(result).toHaveLength(0);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.where.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getDependencies(1)).rejects.toThrow();
        });
    });

    describe('getGanttData', () => {
        it('should return tasks with dates', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTaskData]);

            const result = await taskService.getGanttData(1);

            expect(result).toHaveLength(1);
        });

        it('should filter tasks without dates', async () => {
            const taskNoDate = { ...mockTaskData, startDate: null, dueDate: null };
            mockDbInstance.orderBy.mockResolvedValue([taskNoDate]);

            const result = await taskService.getGanttData(1);

            expect(result).toHaveLength(0);
        });

        it('should filter by projectId', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTaskData]);

            const result = await taskService.getGanttData(1, 1);

            expect(result).toHaveLength(1);
        });

        it('should throw error on failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(taskService.getGanttData(1)).rejects.toThrow();
        });
    });
});
