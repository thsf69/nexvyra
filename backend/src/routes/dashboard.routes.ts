import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { getDashboard } from '../controllers/dashboard.controller';
import { dashboardQuerySchema } from '../schemas/dashboard.schema';

const router = Router();

// Endpoint requires authentication
router.use(requireAuth);

router.get('/', validateRequest(dashboardQuerySchema), getDashboard);

export default router;
