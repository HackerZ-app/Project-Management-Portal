import api from './api';
import { Project, ProjectFormData, ProjectsResponse } from '../types/project.types';

export const projectService = {
  /**
   * Browse published projects with search, filter, and pagination
   */
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    domain?: string;
    courseType?: string;
  }): Promise<ProjectsResponse> {
    const response = await api.get<ProjectsResponse>('/projects', { params });
    return response.data;
  },

  /**
   * Get all projects created by current faculty member
   */
  async getFacultyProjects(): Promise<{ success: boolean; count: number; projects: Project[] }> {
    const response = await api.get<{ success: boolean; count: number; projects: Project[] }>(
      '/projects/faculty/me'
    );
    return response.data;
  },

  /**
   * Get single project details by ID
   */
  async getProjectById(id: string): Promise<{ success: boolean; project: Project }> {
    const response = await api.get<{ success: boolean; project: Project }>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Propose a new project (faculty, coordinator, admin)
   */
  async createProject(
    data: ProjectFormData
  ): Promise<{ success: boolean; message: string; project: Project }> {
    const response = await api.post<{ success: boolean; message: string; project: Project }>(
      '/projects',
      data
    );
    return response.data;
  },

  /**
   * Release final grades for a project and close it (Coordinator / Admin)
   */
  async releaseProjectGrades(
    projectId: string
  ): Promise<{ success: boolean; message: string; project: Project }> {
    const response = await api.put<{ success: boolean; message: string; project: Project }>(
      `/projects/${projectId}/release-grades`
    );
    return response.data;
  },
};

export default projectService;
