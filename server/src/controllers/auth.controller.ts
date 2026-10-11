import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/auth.types';
import { verifyGoogleIdToken, findOrCreateUser, generateToken } from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';
import { ENV } from '../config/env';
import { logger } from '../config/logger';

/**
 * Handle Google OAuth 2.0 Login / Registration
 * POST /api/auth/google
 */
export const googleLogin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      throw new AppError('Google credential token is required', 400);
    }

    // Verify Google ID token and validate @srmap.edu.in domain
    const googleProfile = await verifyGoogleIdToken(credential);

    // Find or register user in MongoDB
    const user = await findOrCreateUser({
      googleId: googleProfile.googleId,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.avatar,
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user profile
 * GET /api/auth/me (Protected)
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Development-only test login simulator
 * POST /api/auth/dev-login
 * Safeguard 2: Strictly sandboxed to non-production environments
 */
export const devLogin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Strictly block in production
    if (process.env.NODE_ENV === 'production' || ENV.IS_PRODUCTION) {
      return next(new AppError('Development endpoints are disabled in production', 403));
    }

    const { email, name, role, department } = req.body;

    if (!email) {
      throw new AppError('Email is required for dev-login', 400);
    }

    const lowerEmail = email.toLowerCase().trim();

    // Still enforce university domain in dev-login
    if (!lowerEmail.endsWith(ENV.ALLOWED_EMAIL_DOMAIN)) {
      throw new AppError(
        `Development login must also use an official domain ending with ${ENV.ALLOWED_EMAIL_DOMAIN}`,
        403
      );
    }

    const validRoles: UserRole[] = ['student', 'faculty', 'coordinator', 'admin'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'student';

    const user = await findOrCreateUser({
      email: lowerEmail,
      name: name || lowerEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      role: assignedRole,
      department: department || 'Computer Science and Engineering',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(lowerEmail)}`,
    });

    // Ensure role is updated if requested
    if (user.role !== assignedRole) {
      user.role = assignedRole;
      await user.save();
    }

    const token = generateToken(user);

    logger.info(`[Dev Login] Authenticated ${user.email} as ${user.role}`);

    res.status(200).json({
      success: true,
      message: `Development login successful as ${user.role}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
