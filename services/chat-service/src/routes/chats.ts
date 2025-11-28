import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's chats
router.get('/my', (req, res, next) => chatController.getUserChats(req, res).catch(next));

// Get project chats
router.get('/project/:projectId', (req, res, next) =>
  chatController.getProjectChats(req, res).catch(next)
);

// Get team chats
router.get('/team/:teamId', (req, res, next) =>
  chatController.getTeamChats(req, res).catch(next)
);

// Find or create direct chat
router.post('/direct', (req, res, next) =>
  chatController.findOrCreateDirectChat(req, res).catch(next)
);

// Create chat
router.post('/', (req, res, next) => chatController.createChat(req, res).catch(next));

// Get chat by ID
router.get('/:id', (req, res, next) => chatController.getChat(req, res).catch(next));

// Update chat
router.put('/:id', (req, res, next) => chatController.updateChat(req, res).catch(next));

// Delete chat
router.delete('/:id', (req, res, next) => chatController.deleteChat(req, res).catch(next));

// Get chat members
router.get('/:id/members', (req, res, next) =>
  chatController.getChatMembers(req, res).catch(next)
);

// Add member to chat
router.post('/:id/members', (req, res, next) =>
  chatController.addMember(req, res).catch(next)
);

// Remove member from chat
router.delete('/:id/members/:userId', (req, res, next) =>
  chatController.removeMember(req, res).catch(next)
);

export default router;
