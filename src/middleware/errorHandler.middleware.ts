import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    error: {
      name: err.name,
      statusCode: err.statusCode,
      status: err.status,
      ...(err.clientVersion && { clientVersion: err.clientVersion })
    },
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};