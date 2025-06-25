import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = AppError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};