import { Request, Response, NextFunction } from 'express';
import { getDashboardMetrics } from '../services/dashboard.service';
import { formatResponse } from '../utils/ApiError';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const metrics = await getDashboardMetrics(userId);

    res.json(formatResponse(true, 'Dashboard data fetched successfully', metrics));
  } catch (error) {
    next(error);
  }
};
