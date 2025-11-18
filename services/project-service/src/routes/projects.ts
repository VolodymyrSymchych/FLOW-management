import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Specific routes must come before parameterized routes
// GET /projects/stats - Get project statistics
router.get('/stats', (req, res, next) => projectController.getProjectStats(req, res, next));

// GET /projects/templates - Get all templates
router.get('/templates', (req, res, next) => projectController.getTemplates(req, res, next));

// POST /projects/from-template - Create project from template
router.post('/from-template', (req, res, next) => projectController.createFromTemplate(req, res, next));

// GET /projects/templates/:id - Get template by ID (must be after /templates)
router.get('/templates/:id', (req, res, next) => projectController.getTemplate(req, res, next));

// GET /projects - Get all projects for current user
router.get('/', (req, res, next) => projectController.getProjects(req, res, next));

// POST /projects - Create new project
router.post('/', (req, res, next) => projectController.createProject(req, res, next));

// GET /projects/:id/stats - Get project statistics (alternative route)
router.get('/:id/stats', (req, res, next) => projectController.getProjectStats(req, res, next));

// GET /projects/:id - Get project by ID
router.get('/:id', (req, res, next) => projectController.getProject(req, res, next));

// PUT /projects/:id - Update project
router.put('/:id', (req, res, next) => projectController.updateProject(req, res, next));

// DELETE /projects/:id - Delete project
router.delete('/:id', (req, res, next) => projectController.deleteProject(req, res, next));

export default router;

