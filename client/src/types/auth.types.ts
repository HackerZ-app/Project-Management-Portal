export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  isProfileComplete?: boolean;
  cgpa?: number;
  rollNumber?: string;
  semester?: number;
  prerequisitesCompleted?: string[];
  hasDisciplinaryAction?: boolean;
  isEligible?: boolean;
  eligibilityDetails?: Record<string, any> | null;
  phone?: string;
  skills?: string[];
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  stack?: string;
}
