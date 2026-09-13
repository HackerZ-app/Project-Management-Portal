import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/auth.types';
import { verifyJwtToken } from '../services/auth.service';
import { User } from '../models/user.model';
import { AppError } from './error.middleware';

/**
 * Middleware to verify JWT from the Authorization header and attach fresh user to request
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Token missing in Authorization header', 401);
    }

    // Decode & verify JWT
    const decoded = verifyJwtToken(token);

    // Fetch user from DB to ensure account is active and role is fresh
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * Restricts endpoint access to users with specified roles.
 */
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User context missing', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Insufficient privileges. Required: [${allowedRoles.join(', ')}], Current: '${req.user.role}'`,
          403
        )
      );
    }

    next();
  };
};
