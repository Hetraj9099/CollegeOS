export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  event_type: "EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS";
  related_task_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCalendarEventPayload {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: "EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS";
  related_task_id?: string | null;
}

export interface UpdateCalendarEventPayload {
  title?: string;
  description?: string | null;
  start_time?: string;
  end_time?: string;
  event_type?: "EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS";
  related_task_id?: string | null;
}
