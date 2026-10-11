import { User } from './auth.types';
import { Project } from './project.types';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Meeting {
  _id: string;
  project: Project | string;
  faculty: User;
  title: string;
  agenda: string;
  scheduledAt: string;
  meetingLink: string;
  status: MeetingStatus;
  meetingMinutes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingResponse {
  success: boolean;
  message?: string;
  meeting: Meeting;
}

export interface MeetingListResponse {
  success: boolean;
  count: number;
  meetings: Meeting[];
}
