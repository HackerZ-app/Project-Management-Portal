export interface CriteriaChecks {
  cgpa: { required: number; actual: number; passed: boolean };
  semester: { required: number; actual: number; passed: boolean };
  disciplinary: { passed: boolean };
  prerequisites: {
    required: string[];
    missing: string[];
    passed: boolean;
  };
}

export interface CourseEvaluation {
  isEligible: boolean;
  criteria: {
    minCgpa: number;
    minSemester: number;
    requiredPrerequisites: string[];
  };
  checks: CriteriaChecks;
  failureReasons: string[];
}

export interface EligibilityResponse {
  success: boolean;
  source: 'cache' | 'computed';
  isEligible: boolean;
  evaluations: Record<string, CourseEvaluation>;
  studentAcademicSummary: {
    cgpa: number;
    semester: number;
    hasDisciplinaryAction: boolean;
    prerequisitesCompleted: string[];
    department: string;
  };
}
