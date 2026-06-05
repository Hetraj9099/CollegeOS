export interface StudyTrendPoint {
  date: string;
  minutes: number;
}

export interface SubjectAllocationPoint {
  subject_id: string;
  subject_name: string;
  subject_color: string;
  minutes: number;
  percentage: number;
}

export interface GpaTrendPoint {
  semester_id: string;
  semester_number: number;
  academic_year: string;
  sgpa: number | null;
  cgpa: number | null;
}

export interface ProductivitySummary {
  total_study_time_minutes: number;
  average_session_minutes: number;
  total_sessions_completed: number;
  highest_daily_study_minutes: number;
}

export interface AnalyticsDashboardData {
  study_trends: StudyTrendPoint[];
  subject_allocations: SubjectAllocationPoint[];
  gpa_trends: GpaTrendPoint[];
  productivity: ProductivitySummary;
}
