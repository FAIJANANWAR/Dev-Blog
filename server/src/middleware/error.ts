import { Request, Response, NextFunction } from 'express';

/**
 * Centered error handling middleware for handling all Express request errors.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled API Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
