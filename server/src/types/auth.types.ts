import { Request } from 'express';
import { IUser } from '../models/user.model';

export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface GoogleProfilePayload {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  hd?: string;
}

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
