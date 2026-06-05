import { CgpaRepository } from "./repository.js";
import { SemestersRepository } from "../semesters/repository.js";
import type { SetCgpaGoalPayload, CgpaFeasibilitySummary } from "./types.js";

export class CgpaService {
  constructor(
    private readonly repository = new CgpaRepository(),
    private readonly semestersRepository = new SemestersRepository()
  ) {}

  async getGoal() {
    return this.repository.getLatestGoal();
  }

  async setGoal(payload: SetCgpaGoalPayload) {
    return this.repository.setGoal(payload);
  }

  async getFeasibilitySummary(remainingSemestersInput?: number): Promise<CgpaFeasibilitySummary> {
    const goal = await this.getGoal();
    if (!goal) {
      return {
        goal: null,
        remaining_semesters: remainingSemestersInput ?? 4,
        required_average_sgpa: null,
        feasibility: "N/A",
        message: "No CGPA goal has been configured yet."
      };
    }

    const semesters = await this.semestersRepository.list();
    const completedSemesters = semesters.filter(s => s.sgpa !== null);
    const nCompleted = completedSemesters.length;
    const nRemaining = remainingSemestersInput ?? Math.max(1, 8 - nCompleted);
    
    const currentCgpa = Number(goal.current_cgpa);
    const targetCgpa = Number(goal.target_cgpa);
    
    const totalSemesters = nCompleted + nRemaining;
    const requiredSgpa = ((targetCgpa * totalSemesters) - (currentCgpa * nCompleted)) / nRemaining;
    const roundedSgpa = Number(requiredSgpa.toFixed(2));

    let feasibility: "EASY" | "MEDIUM" | "HARD" | "IMPOSSIBLE" = "EASY";
    let message = "";

    if (roundedSgpa > 10) {
      feasibility = "IMPOSSIBLE";
      message = `This goal is mathematically impossible (requires an average SGPA of ${roundedSgpa}, which exceeds the maximum of 10.0).`;
    } else if (roundedSgpa >= 9.0) {
      feasibility = "HARD";
      message = `Requires an outstanding average SGPA of ${roundedSgpa}. You will need to achieve mostly A/A+ grades.`;
    } else if (roundedSgpa >= 8.0) {
      feasibility = "MEDIUM";
      message = `Requires a solid average SGPA of ${roundedSgpa}. Achievable with consistent effort and good grades.`;
    } else {
      feasibility = "EASY";
      message = roundedSgpa <= currentCgpa 
        ? `You are already on track or have exceeded this goal! (Required SGPA: ${roundedSgpa})`
        : `A comfortable target SGPA of ${roundedSgpa}. Keep up the steady work.`;
    }

    return {
      goal,
      remaining_semesters: nRemaining,
      required_average_sgpa: roundedSgpa,
      feasibility,
      message
    };
  }
}
