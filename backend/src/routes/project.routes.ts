import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { uuidParamSchema } from '../schemas/common.schema';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from '../schemas/project.schema';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

router.get('/', validateRequest(projectQuerySchema), getProjects);
router.post('/', validateRequest(createProjectSchema), createProject);

router.get('/:id', validateRequest(uuidParamSchema), getProjectById);
router.put('/:id', validateRequest(uuidParamSchema), validateRequest(updateProjectSchema), updateProject);
router.delete('/:id', validateRequest(uuidParamSchema), deleteProject);

export default router;
