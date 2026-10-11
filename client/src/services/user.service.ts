import api from './api';
import { User } from '../types/auth.types';

export const userService = {
  /**
   * Fetch current user profile
   */
  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await api.get<{ success: boolean; user: User }>('/users/profile');
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    const response = await api.put<{ success: boolean; message: string; user: User }>(
      '/users/profile',
      profileData
    );
    return response.data;
  },

  /**
   * Admin/Coordinator update of student official academic record
   */
  async adminUpdateAcademicRecord(
    userId: string,
    data: {
      cgpa?: number;
      semester?: number;
      prerequisitesCompleted?: string[];
      hasDisciplinaryAction?: boolean;
      rollNumber?: string;
      department?: string;
    }
  ): Promise<{ success: boolean; message: string; student: User }> {
    const response = await api.patch<{ success: boolean; message: string; student: User }>(
      `/users/${userId}/academic-record`,
      data
    );
    return response.data;
  },
};

export default userService;
