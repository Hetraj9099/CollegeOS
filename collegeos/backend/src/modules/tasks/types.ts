export interface TaskList {
  id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  list_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  due_date: Date | null;
  completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskListPayload {
  name: string;
  color: string;
}

export interface CreateTaskPayload {
  list_id: string;
  subject_id?: string | null;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  due_date?: string | null;
}

export interface UpdateTaskPayload {
  list_id?: string;
  subject_id?: string | null;
  title?: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  due_date?: string | null;
  completed?: boolean;
}
