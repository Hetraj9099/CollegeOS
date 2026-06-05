export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  course_code: string;
  credits: number;
  color: string;
  course_type: "THEORY" | "THEORY_PRACTICAL";
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubjectPayload {
  semester_id: string;
  name: string;
  course_code: string;
  credits: number;
  color: string;
  course_type: "THEORY" | "THEORY_PRACTICAL";
}
