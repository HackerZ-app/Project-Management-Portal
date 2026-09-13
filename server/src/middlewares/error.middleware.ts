import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ENV } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[Server Error] ${statusCode} - ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[Client Error] ${statusCode} - ${message}`);
  }

  // Handle Mongo duplicate key error (E11000)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A resource with that identifier already exists',
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: messages.join(', ') || 'Validation error',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Authorization token has expired',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.IS_PRODUCTION ? {} : { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
