// Mock database with function call pattern
const mockDbInstance = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};

const mockDbFn = jest.fn(() => mockDbInstance);

jest.mock('../../src/db', () => ({
    db: mockDbFn,
    projects: {
        id: 'id',
        userId: 'userId',
        teamId: 'teamId',
        name: 'name',
        status: 'status',
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
    },
    projectTemplates: {
        id: 'id',
        isPublic: 'isPublic',
        usageCount: 'usageCount',
    },
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ field, value })),
    and: jest.fn((...conditions) => ({ type: 'and', conditions })),
    isNull: jest.fn((field) => ({ isNull: field })),
    desc: jest.fn((field) => ({ desc: field })),
    sql: jest.fn((strings, ...values) => ({ sql: strings.join('?'), values })),
}));

import { ProjectService, Project, CreateProjectInput } from '../../src/services/project.service';

describe('ProjectService', () => {
    let projectService: ProjectService;

    const mockProjectData = {
        id: 1,
        userId: 1,
        teamId: null,
        name: 'Test Project',
        type: 'web',
        industry: 'tech',
        teamSize: '5-10',
        timeline: '3 months',
        budget: 50000,
        score: 85,
        riskLevel: 'low',
        status: 'in_progress',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-04-01'),
        document: null,
        analysisData: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
    };

    beforeEach(() => {
        projectService = new ProjectService();
        jest.clearAllMocks();

        // Reset mock chains
        mockDbInstance.select.mockReturnThis();
        mockDbInstance.from.mockReturnThis();
        mockDbInstance.where.mockReturnThis();
        mockDbInstance.insert.mockReturnThis();
        mockDbInstance.values.mockReturnThis();
        mockDbInstance.update.mockReturnThis();
        mockDbInstance.set.mockReturnThis();
    });

    describe('getUserProjects', () => {
        it('should return user projects', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockProjectData]);

            const result = await projectService.getUserProjects(1);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Test Project');
        });

        it('should return empty array when no projects', async () => {
            mockDbInstance.orderBy.mockResolvedValue([]);

            const result = await projectService.getUserProjects(1);

            expect(result).toHaveLength(0);
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getUserProjects(1)).rejects.toThrow();
        });
    });

    describe('getProjectsByTeam', () => {
        it('should return team projects', async () => {
            mockDbInstance.orderBy.mockResolvedValue([{ ...mockProjectData, teamId: 1 }]);

            const result = await projectService.getProjectsByTeam(1, 1);

            expect(result).toHaveLength(1);
            expect(result[0].teamId).toBe(1);
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getProjectsByTeam(1, 1)).rejects.toThrow();
        });
    });

    describe('getProjectById', () => {
        it('should return project when found', async () => {
            mockDbInstance.where.mockResolvedValue([mockProjectData]);

            const result = await projectService.getProjectById(1);

            expect(result).not.toBeNull();
            expect(result?.id).toBe(1);
        });

        it('should return null when not found', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            const result = await projectService.getProjectById(999);

            expect(result).toBeNull();
        });

        it('should filter by userId when provided', async () => {
            mockDbInstance.where.mockResolvedValue([mockProjectData]);

            const result = await projectService.getProjectById(1, 1);

            expect(result).not.toBeNull();
            expect(mockDbInstance.where).toHaveBeenCalled();
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.where.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getProjectById(1)).rejects.toThrow();
        });
    });

    describe('createProject', () => {
        it('should create project successfully', async () => {
            mockDbInstance.returning.mockResolvedValue([mockProjectData]);

            const input: CreateProjectInput = {
                name: 'Test Project',
                type: 'web',
            };

            const result = await projectService.createProject(1, input);

            expect(result.name).toBe('Test Project');
            expect(mockDbInstance.insert).toHaveBeenCalled();
        });

        it('should create project with all fields', async () => {
            mockDbInstance.returning.mockResolvedValue([mockProjectData]);

            const input: CreateProjectInput = {
                name: 'Full Project',
                teamId: 1,
                type: 'web',
                industry: 'tech',
                teamSize: '5-10',
                timeline: '3 months',
                budget: 50000,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-04-01'),
                document: 'doc content',
            };

            const result = await projectService.createProject(1, input);

            expect(result).toBeDefined();
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(
                projectService.createProject(1, { name: 'Test' })
            ).rejects.toThrow();
        });
    });

    describe('updateProject', () => {
        it('should update project successfully', async () => {
            const updatedProject = { ...mockProjectData, name: 'Updated Project' };
            mockDbInstance.returning.mockResolvedValue([updatedProject]);

            const result = await projectService.updateProject(1, 1, { name: 'Updated Project' });

            expect(result?.name).toBe('Updated Project');
        });

        it('should update all fields', async () => {
            mockDbInstance.returning.mockResolvedValue([mockProjectData]);

            const result = await projectService.updateProject(1, 1, {
                name: 'Updated',
                type: 'mobile',
                industry: 'finance',
                teamSize: '10-20',
                timeline: '6 months',
                budget: 100000,
                startDate: new Date(),
                endDate: new Date(),
                status: 'completed',
                score: 95,
                riskLevel: 'high',
                document: 'new doc',
                analysisData: 'analysis',
            });

            expect(result).toBeDefined();
        });

        it('should return null when project not found', async () => {
            mockDbInstance.returning.mockResolvedValue([]);

            const result = await projectService.updateProject(999, 1, { name: 'Test' });

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(
                projectService.updateProject(1, 1, { name: 'Test' })
            ).rejects.toThrow();
        });
    });

    describe('deleteProject', () => {
        it('should soft delete project successfully', async () => {
            mockDbInstance.returning.mockResolvedValue([{ ...mockProjectData, deletedAt: new Date() }]);

            const result = await projectService.deleteProject(1, 1);

            expect(result).toBe(true);
        });

        it('should return false when project not found', async () => {
            mockDbInstance.returning.mockResolvedValue([]);

            const result = await projectService.deleteProject(999, 1);

            expect(result).toBe(false);
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(projectService.deleteProject(1, 1)).rejects.toThrow();
        });
    });

    describe('getProjectStats', () => {
        it('should return stats for user with projects', async () => {
            const projects = [
                { ...mockProjectData, status: 'in_progress', budget: 50000, score: 80, type: 'web' },
                { ...mockProjectData, id: 2, status: 'completed', budget: 30000, score: 90, type: 'mobile' },
            ];
            mockDbInstance.where.mockResolvedValue(projects);

            const result = await projectService.getProjectStats(1);

            expect(result.totalProjects).toBe(2);
            expect(result.activeProjects).toBe(1);
            expect(result.completedProjects).toBe(1);
            expect(result.totalBudget).toBe(80000);
        });

        it('should return zero stats for user with no projects', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            const result = await projectService.getProjectStats(1);

            expect(result.totalProjects).toBe(0);
            expect(result.averageScore).toBe(0);
        });

        it('should handle projects without type', async () => {
            mockDbInstance.where.mockResolvedValue([{ ...mockProjectData, type: null }]);

            const result = await projectService.getProjectStats(1);

            expect(result.projectsByType).toEqual({});
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.where.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getProjectStats(1)).rejects.toThrow();
        });
    });

    describe('getTemplates', () => {
        const mockTemplate = {
            id: 1,
            name: 'Template 1',
            description: 'Test template',
            category: 'web',
            templateData: '{"name": "Default"}',
            isPublic: true,
            createdBy: 1,
            usageCount: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should return all templates', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTemplate]);

            const result = await projectService.getTemplates();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Template 1');
        });

        it('should filter by isPublic', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTemplate]);

            const result = await projectService.getTemplates(true);

            expect(result).toHaveLength(1);
            expect(mockDbInstance.where).toHaveBeenCalled();
        });

        it('should parse templateData JSON', async () => {
            mockDbInstance.orderBy.mockResolvedValue([mockTemplate]);

            const result = await projectService.getTemplates();

            expect(result[0].templateData).toEqual({ name: 'Default' });
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.orderBy.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getTemplates()).rejects.toThrow();
        });
    });

    describe('getTemplateById', () => {
        const mockTemplate = {
            id: 1,
            name: 'Template 1',
            description: 'Test template',
            category: 'web',
            templateData: '{"name": "Default"}',
            isPublic: true,
            createdBy: 1,
            usageCount: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should return template when found', async () => {
            mockDbInstance.where.mockResolvedValue([mockTemplate]);

            const result = await projectService.getTemplateById(1);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Template 1');
        });

        it('should return null when not found', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            const result = await projectService.getTemplateById(999);

            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.where.mockRejectedValue(new Error('DB error'));

            await expect(projectService.getTemplateById(1)).rejects.toThrow();
        });
    });

    describe('createProjectFromTemplate', () => {
        const mockTemplate = {
            id: 1,
            name: 'Template 1',
            description: 'Test template',
            category: 'web',
            templateData: '{"name": "Template Project", "type": "web", "budget": 50000}',
            isPublic: true,
            createdBy: 1,
            usageCount: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('should create project from template', async () => {
            // First call for getTemplateById
            mockDbInstance.where.mockResolvedValueOnce([mockTemplate]);
            // Second call for createProject
            mockDbInstance.returning.mockResolvedValueOnce([mockProjectData]);
            // Third call for updating usage count
            mockDbInstance.where.mockResolvedValueOnce([]);

            const result = await projectService.createProjectFromTemplate(1, 1);

            expect(result).toBeDefined();
        });

        it('should throw error when template not found', async () => {
            mockDbInstance.where.mockResolvedValue([]);

            await expect(
                projectService.createProjectFromTemplate(1, 999)
            ).rejects.toThrow('Template not found');
        });

        it('should apply overrides', async () => {
            mockDbInstance.where.mockResolvedValueOnce([mockTemplate]);
            mockDbInstance.returning.mockResolvedValueOnce([{ ...mockProjectData, name: 'Override Name' }]);
            mockDbInstance.where.mockResolvedValueOnce([]);

            const result = await projectService.createProjectFromTemplate(1, 1, {
                name: 'Override Name',
                budget: 100000,
            });

            expect(result).toBeDefined();
        });

        it('should throw error on database failure', async () => {
            mockDbInstance.where.mockResolvedValueOnce([mockTemplate]);
            mockDbInstance.returning.mockRejectedValue(new Error('DB error'));

            await expect(
                projectService.createProjectFromTemplate(1, 1)
            ).rejects.toThrow();
        });
    });
});
