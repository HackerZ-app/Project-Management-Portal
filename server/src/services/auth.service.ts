import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User, IUser } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { GoogleProfilePayload, JWTPayload, UserRole } from '../types/auth.types';
import { logger } from '../config/logger';

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID Token and validates the university domain (@srmap.edu.in)
 * Uses both Google's native 'hd' (Hosted Domain) claim and email suffix check.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfilePayload> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: ENV.GOOGLE_CLIENT_ID || undefined,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token: missing email profile', 400);
    }

    const email = payload.email.toLowerCase();
    const hostedDomain = payload.hd;

    // Safeguard 1: Inspect Google's native hd claim & email suffix
    const isDomainValid =
      hostedDomain === ENV.ALLOWED_HOSTED_DOMAIN &&
      email.endsWith(ENV.ALLOWED_EMAIL_DOMAIN);

    if (!isDomainValid) {
      logger.warn(`Rejected login attempt from unauthorized domain. Email: ${email}, hd: ${hostedDomain}`);
      throw new AppError(
        `Unauthorized domain. Please sign in with your official university account (${ENV.ALLOWED_EMAIL_DOMAIN}).`,
        403
      );
    }

    return {
      googleId: payload.sub,
      email,
      name: payload.name || email.split('@')[0],
      avatar: payload.picture || '',
      hd: hostedDomain,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Google token verification failed:', error);
    throw new AppError('Failed to verify Google token with OAuth provider', 401);
  }
};

/**
 * Finds an existing user by email or creates a new user with default 'student' role
 */
export const findOrCreateUser = async (profile: {
  googleId?: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
  department?: string;
}): Promise<IUser> => {
  const email = profile.email.toLowerCase();

  let user = await User.findOne({ email });

  if (user) {
    // Update profile info if changed
    let updated = false;
    if (profile.googleId && !user.googleId) {
      user.googleId = profile.googleId;
      updated = true;
    }
    if (profile.avatar && user.avatar !== profile.avatar) {
      user.avatar = profile.avatar;
      updated = true;
    }
    if (profile.name && user.name !== profile.name) {
      user.name = profile.name;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
    return user;
  }

  // Create new user record
  user = await User.create({
    email,
    name: profile.name,
    googleId: profile.googleId,
    avatar: profile.avatar || '',
    role: profile.role || 'student',
    department: profile.department || 'Computer Science and Engineering',
  });

  logger.info(`New user registered: ${user.email} with role ${user.role}`);
  return user;
};

/**
 * Generates a signed JWT for the authenticated user
 */
export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Decodes and verifies a JWT string
 */
export const verifyJwtToken = (token: string): JWTPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
};
