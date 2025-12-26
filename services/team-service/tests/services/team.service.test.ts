// Mock shared package first
jest.mock('@project-scope-analyzer/shared', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'NotFoundError';
        }
    },
    ForbiddenError: class ForbiddenError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ForbiddenError';
        }
    },
    ValidationError: class ValidationError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ValidationError';
        }
    },
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
    eq: jest.fn((field, value) => ({ eq: field, value })),
    and: jest.fn((...args) => ({ and: args })),
    sql: jest.fn((strings, ...values) => ({ sql: strings, values })),
}));

// Mock DB schema
jest.mock('../../src/db/schema', () => ({
    teams: { id: 'id', ownerId: 'ownerId' },
    teamMembers: { teamId: 'teamId', userId: 'userId' },
    teamProjects: {},
}));

// Create mock chain
const createDbChain = () => {
    const chain: any = {};
    chain.select = jest.fn(() => chain);
    chain.from = jest.fn(() => chain);
    chain.leftJoin = jest.fn(() => chain);
    chain.where = jest.fn(() => chain);
    chain.groupBy = jest.fn(() => Promise.resolve([]));
    chain.insert = jest.fn(() => chain);
    chain.values = jest.fn(() => chain);
    chain.update = jest.fn(() => chain);
    chain.set = jest.fn(() => chain);
    chain.delete = jest.fn(() => chain);
    chain.returning = jest.fn(() => Promise.resolve([]));
    chain.then = (resolve: any) => resolve([]);
    return chain;
};

let mockChain = createDbChain();
const mockDb = jest.fn(() => mockChain);

jest.mock('../../src/db', () => ({
    db: mockDb,
}));

import { TeamService } from '../../src/services/team.service';

describe('TeamService', () => {
    let teamService: TeamService;

    const mockTeam = {
        id: 1,
        name: 'Test Team',
        description: 'Description',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockMember = {
        id: 1,
        teamId: 1,
        userId: 2,
        role: 'member',
        createdAt: new Date(),
    };

    beforeEach(() => {
        mockChain = createDbChain();
        mockDb.mockReturnValue(mockChain);
        teamService = new TeamService();
        jest.clearAllMocks();
    });

    describe('getUserTeams', () => {
        it('should return user teams', async () => {
            mockChain.groupBy = jest.fn(() => Promise.resolve([mockTeam]));

            const result = await teamService.getUserTeams(1);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Test Team');
        });

        it('should return empty array when no teams', async () => {
            mockChain.groupBy = jest.fn(() => Promise.resolve([]));

            const result = await teamService.getUserTeams(1);

            expect(result).toHaveLength(0);
        });

        it('should throw and log error on failure', async () => {
            mockChain.groupBy = jest.fn(() => Promise.reject(new Error('DB error')));

            await expect(teamService.getUserTeams(1)).rejects.toThrow('DB error');
        });
    });

    describe('getTeamById', () => {
        it('should return team when found', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);

            const result = await teamService.getTeamById(1);

            expect(result.id).toBe(1);
        });

        it('should throw NotFoundError when not found', async () => {
            mockChain.then = (resolve: any) => resolve([]);

            await expect(teamService.getTeamById(999)).rejects.toThrow('Team not found');
        });

        it('should check access when userId provided and user is owner', async () => {
            // First call returns team, second call for checkUserAccess also returns team
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                return resolve([mockTeam]);
            };

            const result = await teamService.getTeamById(1, 1);

            expect(result.id).toBe(1);
        });

        it('should throw ForbiddenError when user has no access', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([{ ...mockTeam, ownerId: 999 }]); // getTeamById
                if (callCount === 2) return resolve([{ ...mockTeam, ownerId: 999 }]); // checkUserAccess - team
                return resolve([]); // checkUserAccess - member check
            };

            await expect(teamService.getTeamById(1, 2)).rejects.toThrow('You do not have access to this team');
        });

        it('should allow access when user is member', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([{ ...mockTeam, ownerId: 999 }]); // getTeamById
                if (callCount === 2) return resolve([{ ...mockTeam, ownerId: 999 }]); // checkUserAccess - team
                return resolve([mockMember]); // checkUserAccess - member check - is member
            };

            const result = await teamService.getTeamById(1, 2);
            expect(result.id).toBe(1);
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = () => { throw new Error('DB error'); };

            await expect(teamService.getTeamById(1)).rejects.toThrow('DB error');
        });
    });

    describe('createTeam', () => {
        it('should create team', async () => {
            mockChain.returning = jest.fn(() => Promise.resolve([mockTeam]));

            const result = await teamService.createTeam({ name: 'New Team', ownerId: 1 });

            expect(result.name).toBe('Test Team');
        });

        it('should throw and log error on failure', async () => {
            mockChain.returning = jest.fn(() => Promise.reject(new Error('DB error')));

            await expect(teamService.createTeam({ name: 'Test', ownerId: 1 })).rejects.toThrow('DB error');
        });
    });

    describe('updateTeam', () => {
        it('should update team when owner', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);
            mockChain.returning = jest.fn(() => Promise.resolve([{ ...mockTeam, name: 'Updated' }]));

            const result = await teamService.updateTeam(1, 1, { name: 'Updated' });

            expect(result.name).toBe('Updated');
        });

        it('should throw ForbiddenError when not owner', async () => {
            mockChain.then = (resolve: any) => resolve([{ ...mockTeam, ownerId: 999 }]);

            await expect(teamService.updateTeam(1, 1, { name: 'Updated' })).rejects.toThrow('Only team owner can update team');
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);
            mockChain.returning = jest.fn(() => Promise.reject(new Error('DB error')));

            await expect(teamService.updateTeam(1, 1, { name: 'Test' })).rejects.toThrow('DB error');
        });
    });

    describe('deleteTeam', () => {
        it('should delete team when owner', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);

            await teamService.deleteTeam(1, 1);

            expect(mockChain.delete).toHaveBeenCalled();
        });

        it('should throw ForbiddenError when not owner', async () => {
            mockChain.then = (resolve: any) => resolve([{ ...mockTeam, ownerId: 999 }]);

            await expect(teamService.deleteTeam(1, 1)).rejects.toThrow('Only team owner can delete team');
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = () => { throw new Error('DB error'); };

            await expect(teamService.deleteTeam(1, 1)).rejects.toThrow('DB error');
        });
    });

    describe('getTeamMembers', () => {
        it('should return team members', async () => {
            mockChain.then = (resolve: any) => resolve([mockMember]);

            const result = await teamService.getTeamMembers(1);

            expect(result).toHaveLength(1);
        });

        it('should check access when userId provided', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount <= 2) return resolve([mockTeam]); // checkUserAccess calls
                return resolve([mockMember]); // getTeamMembers
            };

            const result = await teamService.getTeamMembers(1, 1);

            expect(result).toHaveLength(1);
        });

        it('should throw ForbiddenError when no access', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([{ ...mockTeam, ownerId: 999 }]);
                return resolve([]);
            };

            await expect(teamService.getTeamMembers(1, 2)).rejects.toThrow('You do not have access to this team');
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = () => { throw new Error('DB error'); };

            await expect(teamService.getTeamMembers(1)).rejects.toThrow('DB error');
        });
    });

    describe('addTeamMember', () => {
        it('should add member when owner and not existing', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([mockTeam]); // getTeamById
                return resolve([]); // existing member check
            };
            mockChain.returning = jest.fn(() => Promise.resolve([mockMember]));

            const result = await teamService.addTeamMember(1, 1, 2, 'member');

            expect(result.userId).toBe(2);
        });

        it('should throw ForbiddenError when not owner', async () => {
            mockChain.then = (resolve: any) => resolve([{ ...mockTeam, ownerId: 999 }]);

            await expect(teamService.addTeamMember(1, 1, 2, 'member')).rejects.toThrow('Only team owner can add members');
        });

        it('should throw ValidationError when member already exists', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([mockTeam]);
                return resolve([mockMember]);
            };

            await expect(teamService.addTeamMember(1, 1, 2, 'member')).rejects.toThrow('User is already a member of this team');
        });

        it('should throw and log error on failure', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([mockTeam]);
                return resolve([]);
            };
            mockChain.returning = jest.fn(() => Promise.reject(new Error('DB error')));

            await expect(teamService.addTeamMember(1, 1, 2)).rejects.toThrow('DB error');
        });
    });

    describe('removeTeamMember', () => {
        it('should remove member when owner', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);

            await teamService.removeTeamMember(1, 1, 2);

            expect(mockChain.delete).toHaveBeenCalled();
        });

        it('should throw ForbiddenError when not owner', async () => {
            mockChain.then = (resolve: any) => resolve([{ ...mockTeam, ownerId: 999 }]);

            await expect(teamService.removeTeamMember(1, 1, 2)).rejects.toThrow('Only team owner can remove members');
        });

        it('should throw ValidationError when trying to remove owner', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);

            await expect(teamService.removeTeamMember(1, 1, 1)).rejects.toThrow('Cannot remove team owner from team');
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = () => { throw new Error('DB error'); };

            await expect(teamService.removeTeamMember(1, 1, 2)).rejects.toThrow('DB error');
        });
    });

    describe('updateMemberRole', () => {
        it('should update role when owner', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);
            mockChain.returning = jest.fn(() => Promise.resolve([{ ...mockMember, role: 'admin' }]));

            const result = await teamService.updateMemberRole(1, 1, 2, 'admin');

            expect(result.role).toBe('admin');
        });

        it('should throw ForbiddenError when not owner', async () => {
            mockChain.then = (resolve: any) => resolve([{ ...mockTeam, ownerId: 999 }]);

            await expect(teamService.updateMemberRole(1, 1, 2, 'admin')).rejects.toThrow('Only team owner can update member roles');
        });

        it('should throw NotFoundError when member not found', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);
            mockChain.returning = jest.fn(() => Promise.resolve([]));

            await expect(teamService.updateMemberRole(1, 1, 999, 'admin')).rejects.toThrow('Team member not found');
        });

        it('should throw and log error on failure', async () => {
            mockChain.then = (resolve: any) => resolve([mockTeam]);
            mockChain.returning = jest.fn(() => Promise.reject(new Error('DB error')));

            await expect(teamService.updateMemberRole(1, 1, 2, 'admin')).rejects.toThrow('DB error');
        });
    });

    describe('checkUserAccess (via getTeamById)', () => {
        it('should return false when team not found', async () => {
            let callCount = 0;
            mockChain.then = (resolve: any) => {
                callCount++;
                if (callCount === 1) return resolve([mockTeam]); // getTeamById
                return resolve([]); // checkUserAccess - team not found
            };

            await expect(teamService.getTeamById(1, 2)).rejects.toThrow('You do not have access');
        });
    });
});
