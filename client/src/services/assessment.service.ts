import api from './api';
import {
  AssessmentResponse,
  ProjectAssessmentsResponse,
  SubmissionResponse,
  AssessmentSubmissionsResponse,
} from '../types/assessment.types';

export const assessmentService = {
  /**
   * Create an assessment milestone for a project (Faculty)
   */
  async createAssessment(data: {
    title: string;
    description: string;
    projectId: string;
    deadline: string;
    maxMarks: number;
  }): Promise<AssessmentResponse> {
    const response = await api.post<AssessmentResponse>('/assessments', data);
    return response.data;
  },

  /**
   * Fetch all assessments for a specific project
   */
  async getProjectAssessments(projectId: string): Promise<ProjectAssessmentsResponse> {
    const response = await api.get<ProjectAssessmentsResponse>(
      `/assessments/project/${projectId}`
    );
    return response.data;
  },

  /**
   * Submit student milestone work (consumes multipart/form-data via Multer)
   */
  async submitWork(formData: FormData): Promise<SubmissionResponse> {
    const response = await api.post<SubmissionResponse>('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch submissions for an assessment (Faculty evaluation view)
   */
  async getAssessmentSubmissions(
    assessmentId: string
  ): Promise<AssessmentSubmissionsResponse> {
    const response = await api.get<AssessmentSubmissionsResponse>(
      `/submissions/assessment/${assessmentId}`
    );
    return response.data;
  },

  /**
   * Fetch student/group's own submission for an assessment
   */
  async getMySubmission(assessmentId: string): Promise<SubmissionResponse> {
    const response = await api.get<SubmissionResponse>(
      `/submissions/assessment/${assessmentId}/me`
    );
    return response.data;
  },

  /**
   * Grade or re-evaluate a student milestone submission (Faculty)
   */
  async gradeSubmission(
    submissionId: string,
    data: { marks: number; feedback?: string }
  ): Promise<SubmissionResponse & { isReEvaluation?: boolean }> {
    const response = await api.put<SubmissionResponse & { isReEvaluation?: boolean }>(
      `/submissions/${submissionId}/grade`,
      data
    );
    return response.data;
  },
};

export default assessmentService;
