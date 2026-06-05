export interface Semester {
  id: string;
  semester_number: number;
  academic_year: string;
  total_credits: number;
  sgpa: number | null;
  cgpa: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSemesterPayload {
  semester_number: number;
  academic_year: string;
  total_credits: number;
  sgpa?: number | null;
  cgpa?: number | null;
}
