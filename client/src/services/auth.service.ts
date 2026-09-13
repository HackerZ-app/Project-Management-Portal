import api from './api';
import { AuthResponse, User } from '../types/auth.types';

export const authService = {
  /**
   * Submit Google OAuth credential token to backend
   */
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/google', { credential });
    return response.data;
  },

  /**
   * Development-only sandbox login simulator
   */
  async devLogin(data: {
    email: string;
    name?: string;
    role?: string;
    department?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/dev-login', data);
    return response.data;
  },

  /**
   * Fetch latest profile of authenticated user from database
   */
  async getMe(): Promise<{ success: boolean; user: User }> {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },

  /**
   * Test RBAC endpoint: Admin only
   */
  async testAdminAccess(): Promise<any> {
    const response = await api.get('/auth/admin-only');
    return response.data;
  },

  /**
   * Test RBAC endpoint: Faculty / Coordinator / Admin
   */
  async testFacultyAccess(): Promise<any> {
    const response = await api.get('/auth/faculty-only');
    return response.data;
  },

  /**
   * Test RBAC endpoint: Student / Admin
   */
  async testStudentAccess(): Promise<any> {
    const response = await api.get('/auth/student-only');
    return response.data;
  },
};

export default authService;
