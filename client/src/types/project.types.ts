import { User } from './auth.types';

export type ProjectStatus = 'draft' | 'published' | 'closed' | 'allocated';
export type CourseType = 'Capstone Project' | 'Mini Project' | 'Industrial Project' | 'Research Project';

export interface Project {
  _id: string;
  title: string;
  description: string;
  domain: string;
  courseType: CourseType;
  faculty: User | string;
  requirements: string;
  maxStudents: number;
  currentStudents: number;
  allocatedGroups?: string[];
  deadline: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  domain?: string;
  courseType?: CourseType;
  requirements?: string;
  maxStudents?: number;
  deadline?: string;
  status: ProjectStatus;
}

export interface ProjectsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  pagination: ProjectsPagination;
}
