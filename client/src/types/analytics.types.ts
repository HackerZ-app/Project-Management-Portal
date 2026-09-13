export interface AnalyticsKPIs {
  totalProjects: number;
  totalStudents: number;
  totalFaculty: number;
  totalSubmissions: number;
  totalGraded: number;
  activeProjects: number;
  completedProjects: number;
}

export interface DomainDistribution {
  domain: string;
  count: number;
}

export interface CourseTypeAvgMarks {
  courseType: string;
  avgMarks: number;
  totalEvaluated: number;
}

export interface ProjectStatusBreakdown {
  name: string;
  value: number;
}

export interface AnalyticsDashboardResponse {
  success: boolean;
  kpis: AnalyticsKPIs;
  projectsByDomain: DomainDistribution[];
  avgMarksByCourseType: CourseTypeAvgMarks[];
  projectStatusBreakdown: ProjectStatusBreakdown[];
}
