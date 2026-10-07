import { Request, Response, NextFunction } from 'express';
import { ApiError, formatResponse } from '../utils/ApiError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else {
    // Log unexpected errors
    console.error('Unhandled Exception:', err);
  }

  res.status(statusCode).json(formatResponse(false, message, undefined, errors));
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};
