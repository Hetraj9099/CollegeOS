export interface CgpaGoal {
  id: string;
  current_cgpa: number;
  target_cgpa: number;
  created_at: Date;
  updated_at: Date;
}

export interface SetCgpaGoalPayload {
  current_cgpa: number;
  target_cgpa: number;
}

export interface CgpaFeasibilitySummary {
  goal: CgpaGoal | null;
  remaining_semesters: number;
  required_average_sgpa: number | null;
  feasibility: "EASY" | "MEDIUM" | "HARD" | "IMPOSSIBLE" | "N/A";
  message: string;
}
