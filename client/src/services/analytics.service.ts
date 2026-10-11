import api from './api';
import { AnalyticsDashboardResponse } from '../types/analytics.types';

export const analyticsService = {
  /**
   * Fetch aggregation dashboard metrics for coordinator/admin
   */
  async getDashboardData(): Promise<AnalyticsDashboardResponse> {
    const res = await api.get<AnalyticsDashboardResponse>('/analytics/dashboard');
    return res.data;
  },

  /**
   * Download dynamically generated injection-safe CSV of student project grades
   */
  async downloadGradesCSV(): Promise<void> {
    const res = await api.get('/analytics/export', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `university_project_grades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default analyticsService;
