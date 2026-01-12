import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { teamController } from '../controllers/team.controller';
import { AuthenticatedRequest } from '@project-scope-analyzer/shared';

const router = Router();

// All routes require authentication
router.use(authMiddleware as unknown as RequestHandler);

// Team CRUD operations
router.get('/', (req, res, next) => teamController.getTeams(req as AuthenticatedRequest, res, next));
router.get('/:id', (req, res, next) => teamController.getTeamById(req as AuthenticatedRequest, res, next));
router.post('/', (req, res, next) => teamController.createTeam(req as AuthenticatedRequest, res, next));
router.put('/:id', (req, res, next) => teamController.updateTeam(req as AuthenticatedRequest, res, next));
router.delete('/:id', (req, res, next) => teamController.deleteTeam(req as AuthenticatedRequest, res, next));

// Team members management
router.get('/:id/members', (req, res, next) => teamController.getTeamMembers(req as AuthenticatedRequest, res, next));
router.post('/:id/members', (req, res, next) => teamController.addTeamMember(req as AuthenticatedRequest, res, next));
router.delete('/:id/members/:userId', (req, res, next) => teamController.removeTeamMember(req as AuthenticatedRequest, res, next));
router.put('/:id/members/:userId/role', (req, res, next) => teamController.updateMemberRole(req as AuthenticatedRequest, res, next));

export default router;
