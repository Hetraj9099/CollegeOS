export interface GradeComponent {
  id: string;
  subject_id: string;
  component_name: string;
  max_marks: number;
  weight_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface Grade {
  id: string;
  component_id: string;
  obtained_marks: number;
  created_at: Date;
}

export interface CreateGradeComponentPayload {
  subject_id: string;
  component_name: string;
  max_marks: number;
  weight_percentage: number;
}

export interface RecordGradePayload {
  component_id: string;
  obtained_marks: number;
}

export interface SubjectGradesSummary {
  subject_id: string;
  subject_name: string;
  course_code: string;
  credits: number;
  color: string;
  components: Array<{
    id: string;
    component_name: string;
    max_marks: number;
    weight_percentage: number;
    obtained_marks: number | null;
  }>;
  calculated_percentage: number | null;
  total_weight_submitted: number;
}
