import { User } from './auth.types';
import { Project } from './project.types';
import { Group } from './group.types';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  _id: string;
  project: Project;
  appliedBy: User;
  group?: Group;
  statementOfPurpose: string;
  status: ApplicationStatus;
  feedback?: string;
  evaluatedAt?: string;
  evaluatedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationSubmissionDto {
  projectId: string;
  groupId?: string;
  statementOfPurpose: string;
}

export interface ApplicationEvaluationDto {
  status: 'approved' | 'rejected';
  feedback?: string;
}
