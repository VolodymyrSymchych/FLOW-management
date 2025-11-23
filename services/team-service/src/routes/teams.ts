import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { teamController } from '../controllers/team.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Team CRUD operations
router.get('/', teamController.getTeams.bind(teamController));
router.get('/:id', teamController.getTeamById.bind(teamController));
router.post('/', teamController.createTeam.bind(teamController));
router.put('/:id', teamController.updateTeam.bind(teamController));
router.delete('/:id', teamController.deleteTeam.bind(teamController));

// Team members management
router.get('/:id/members', teamController.getTeamMembers.bind(teamController));
router.post('/:id/members', teamController.addTeamMember.bind(teamController));
router.delete('/:id/members/:userId', teamController.removeTeamMember.bind(teamController));
router.put('/:id/members/:userId/role', teamController.updateMemberRole.bind(teamController));

export default router;
