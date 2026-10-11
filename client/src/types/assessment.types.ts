import { User } from './auth.types';
import { Group } from './group.types';
import { Project } from './project.types';

export type SubmissionStatus = 'submitted' | 'late' | 'graded';

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  project: Project | string;
  faculty: User | string;
  deadline: string;
  maxMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  assessment: Assessment | string;
  submittedBy: User;
  group?: Group | null;
  githubUrl: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResponse {
  success: boolean;
  message?: string;
  assessment: Assessment;
}

export interface ProjectAssessmentsResponse {
  success: boolean;
  count: number;
  assessments: Assessment[];
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  submission: Submission;
}

export interface AssessmentSubmissionsResponse {
  success: boolean;
  count: number;
  submissions: Submission[];
}
