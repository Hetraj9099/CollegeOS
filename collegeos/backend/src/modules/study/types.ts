export interface StudySession {
  id: string;
  subject_id: string | null;
  task_id: string | null;
  session_type: string;
  start_time: Date;
  end_time: Date | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: Date;
  subject_name?: string;
  subject_color?: string;
  task_title?: string;
}

export interface StartStudySessionPayload {
  subject_id?: string | null;
  task_id?: string | null;
  session_type: string;
  start_time: string; // ISO String
}

export interface StopStudySessionPayload {
  end_time: string; // ISO String
  notes?: string | null;
}

export interface CreateStudySessionPayload {
  subject_id?: string | null;
  task_id?: string | null;
  session_type: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
}

export interface StudyStreakSummary {
  current_streak: number;
  best_streak: number;
  total_study_time_minutes: number;
  is_active_today: boolean;
}
