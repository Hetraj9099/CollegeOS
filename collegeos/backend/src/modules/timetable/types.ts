export interface TimetableEntry {
  id: string;
  subject_id: string;
  day_of_week: number; // 1 to 7
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  classroom: string | null;
  created_at: Date;
  updated_at: Date;
  subject_name?: string;
  subject_color?: string;
}

export interface CreateTimetableEntryPayload {
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  classroom?: string | null;
}

export interface UpdateTimetableEntryPayload {
  subject_id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  classroom?: string | null;
}
