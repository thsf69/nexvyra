import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth.routes';
import projectRouter from './project.routes';
import taskRouter from './task.routes';
import dashboardRouter from './dashboard.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/dashboard', dashboardRouter);

export default router;
