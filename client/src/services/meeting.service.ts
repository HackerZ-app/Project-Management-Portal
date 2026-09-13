import api from './api';
import {
  MeetingResponse,
  MeetingListResponse,
} from '../types/meeting.types';

export const meetingService = {
  /**
   * Schedule a new project meeting (Faculty)
   */
  async scheduleMeeting(data: {
    projectId: string;
    title: string;
    agenda: string;
    scheduledAt: string;
    meetingLink?: string;
  }): Promise<MeetingResponse> {
    const response = await api.post<MeetingResponse>('/meetings', data);
    return response.data;
  },

  /**
   * Fetch all meetings for a specific project
   */
  async getProjectMeetings(projectId: string): Promise<MeetingListResponse> {
    const response = await api.get<MeetingListResponse>(`/meetings/project/${projectId}`);
    return response.data;
  },

  /**
   * Fetch all meetings scheduled by the authenticated faculty member
   */
  async getFacultyMeetings(): Promise<MeetingListResponse> {
    const response = await api.get<MeetingListResponse>('/meetings/faculty');
    return response.data;
  },

  /**
   * Log meeting minutes and transition meeting status to 'completed'
   */
  async logMeetingMinutes(
    meetingId: string,
    meetingMinutes: string
  ): Promise<MeetingResponse> {
    const response = await api.put<MeetingResponse>(`/meetings/${meetingId}/minutes`, {
      meetingMinutes,
    });
    return response.data;
  },
};

export default meetingService;
