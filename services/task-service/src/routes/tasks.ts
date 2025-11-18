import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /tasks/gantt - Get Gantt chart data (must be before /:id routes)
router.get('/gantt', (req, res, next) => taskController.getGanttData(req, res, next));

// GET /tasks - Get all tasks for current user
router.get('/', (req, res, next) => taskController.getTasks(req, res, next));

// GET /tasks/:id/subtasks - Get subtasks
router.get('/:id/subtasks', (req, res, next) => taskController.getSubtasks(req, res, next));

// GET /tasks/:id/dependencies - Get dependencies
router.get('/:id/dependencies', (req, res, next) => taskController.getDependencies(req, res, next));

// POST /tasks/:id/subtasks - Create subtask
router.post('/:id/subtasks', (req, res, next) => taskController.createSubtask(req, res, next));

// GET /tasks/:id - Get task by ID
router.get('/:id', (req, res, next) => taskController.getTask(req, res, next));

// PUT /tasks/:id - Update task
router.put('/:id', (req, res, next) => taskController.updateTask(req, res, next));

// DELETE /tasks/:id - Delete task
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next));

// POST /tasks - Create new task (must be after /:id routes)
router.post('/', (req, res, next) => taskController.createTask(req, res, next));

export default router;

