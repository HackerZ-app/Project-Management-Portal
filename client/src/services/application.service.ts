import api from './api';
import {
  Application,
  ApplicationSubmissionDto,
  ApplicationEvaluationDto,
} from '../types/application.types';

export const applicationService = {
  /**
   * Submit an application for a project (solo or with a locked group)
   */
  async submitApplication(
    data: ApplicationSubmissionDto
  ): Promise<{ success: boolean; message: string; application: Application }> {
    const response = await api.post<{ success: boolean; message: string; application: Application }>(
      '/applications',
      data
    );
    return response.data;
  },

  /**
   * Student view of their submitted project applications
   */
  async getMyApplications(): Promise<{ success: boolean; applications: Application[] }> {
    const response = await api.get<{ success: boolean; applications: Application[] }>(
      '/applications/me'
    );
    return response.data;
  },

  /**
   * Faculty view of incoming applications for their mentored projects
   */
  async getFacultyApplications(): Promise<{
    success: boolean;
    count: number;
    applications: Application[];
  }> {
    const response = await api.get<{
      success: boolean;
      count: number;
      applications: Application[];
    }>('/applications/faculty');
    return response.data;
  },

  /**
   * Faculty review action: approve or reject application
   */
  async evaluateApplication(
    id: string,
    data: ApplicationEvaluationDto
  ): Promise<{ success: boolean; message: string; application: Application; project?: any }> {
    const response = await api.put<{
      success: boolean;
      message: string;
      application: Application;
      project?: any;
    }>(`/applications/${id}/evaluate`, data);
    return response.data;
  },
};

export default applicationService;
