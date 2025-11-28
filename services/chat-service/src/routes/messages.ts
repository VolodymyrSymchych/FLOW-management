import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/', (req, res, next) => messageController.sendMessage(req, res).catch(next));

// Get chat messages
router.get('/chat/:chatId', (req, res, next) =>
  messageController.getChatMessages(req, res).catch(next)
);

// Get unread count for chat
router.get('/chat/:chatId/unread', (req, res, next) =>
  messageController.getUnreadCount(req, res).catch(next)
);

// Mark chat as read
router.put('/chat/:chatId/read', (req, res, next) =>
  messageController.markChatAsRead(req, res).catch(next)
);

// Get message by ID
router.get('/:id', (req, res, next) => messageController.getMessage(req, res).catch(next));

// Edit message
router.put('/:id', (req, res, next) => messageController.editMessage(req, res).catch(next));

// Delete message
router.delete('/:id', (req, res, next) => messageController.deleteMessage(req, res).catch(next));

// Mark message as read
router.put('/:id/read', (req, res, next) => messageController.markAsRead(req, res).catch(next));

// Get message reactions
router.get('/:id/reactions', (req, res, next) =>
  messageController.getMessageReactions(req, res).catch(next)
);

// Add reaction
router.post('/:id/reactions', (req, res, next) =>
  messageController.addReaction(req, res).catch(next)
);

// Remove reaction
router.delete('/:id/reactions/:emoji', (req, res, next) =>
  messageController.removeReaction(req, res).catch(next)
);

export default router;
