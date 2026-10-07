import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

export interface AuthPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return next(new ApiError(500, 'JWT secret is not configured'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Authentication token expired'));
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
};
