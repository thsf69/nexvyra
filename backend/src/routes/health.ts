import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { formatResponse } from '../utils/ApiError';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json(formatResponse(true, 'NEXVYRA API is healthy', {
      timestamp: new Date().toISOString(),
      database: 'connected'
    }));
  } catch (error) {
    next(error);
  }
});

export default router;
