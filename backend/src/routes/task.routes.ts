import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { uuidParamSchema } from '../schemas/common.schema';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../schemas/task.schema';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/task.controller';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/', validateRequest(taskQuerySchema), getTasks);
router.post('/', validateRequest(createTaskSchema), createTask);

router.get('/:id', validateRequest(uuidParamSchema), getTaskById);
router.put('/:id', validateRequest(uuidParamSchema), validateRequest(updateTaskSchema), updateTask);
router.delete('/:id', validateRequest(uuidParamSchema), deleteTask);

export default router;
