import { StudyRepository } from "./repository.js";
import type { StartStudySessionPayload, StopStudySessionPayload, CreateStudySessionPayload, StudyStreakSummary } from "./types.js";

export class StudyService {
  constructor(private readonly repository = new StudyRepository()) {}

  async getActiveSession() {
    return this.repository.getActiveSession();
  }

  async startSession(payload: StartStudySessionPayload) {
    const active = await this.repository.getActiveSession();
    if (active) {
      throw new Error("A study session is already active");
    }
    return this.repository.startSession(payload);
  }

  async stopSession(payload: StopStudySessionPayload) {
    const active = await this.repository.getActiveSession();
    if (!active) {
      throw new Error("No active study session found");
    }
    return this.repository.stopSession(active.id, payload);
  }

  async listSessions(filters: { subject_id?: string; limit?: number }) {
    return this.repository.listSessions(filters);
  }

  async createSession(payload: CreateStudySessionPayload) {
    return this.repository.createSession(payload);
  }

  async deleteSession(id: string) {
    return this.repository.deleteSession(id);
  }

  async getStreakSummary(timezoneOffsetMinutes: number = 0): Promise<StudyStreakSummary> {
    const dailyMinutes = await this.repository.getDailyStudyMinutes(timezoneOffsetMinutes);
    const totalStudyTimeMinutes = await this.repository.getTotalStudyTime();

    // Filter dates with >= 30 minutes
    const activeDates = dailyMinutes
      .filter(entry => entry.total_minutes >= 30)
      .map(entry => entry.study_date);

    if (activeDates.length === 0) {
      return {
        current_streak: 0,
        best_streak: 0,
        total_study_time_minutes: totalStudyTimeMinutes,
        is_active_today: false
      };
    }

    // Sort dates just in case (already sorted in query)
    activeDates.sort();

    let current = 0;
    let best = 0;
    let prevDate: Date | null = null;

    for (const dStr of activeDates) {
      const d = new Date(dStr + "T00:00:00");
      if (prevDate === null) {
        current = 1;
      } else {
        const diffTime = d.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          current += 1;
        } else if (diffDays > 1) {
          if (current > best) {
            best = current;
          }
          current = 1;
        }
      }
      prevDate = d;
    }

    if (current > best) {
      best = current;
    }

    // Calculate current streak status based on user local time
    const clientNow = new Date(Date.now() - timezoneOffsetMinutes * 60 * 1000);
    const todayStr = clientNow.toISOString().split("T")[0];
    
    const clientYesterday = new Date(clientNow.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = clientYesterday.toISOString().split("T")[0];

    const hasStudiedToday = activeDates.includes(todayStr);
    const hasStudiedYesterday = activeDates.includes(yesterdayStr);

    let currentStreak = 0;
    if (hasStudiedToday) {
      currentStreak = current;
    } else if (hasStudiedYesterday) {
      currentStreak = current; // Keep streak alive today
    } else {
      currentStreak = 0; // Streak reset
    }

    return {
      current_streak: currentStreak,
      best_streak: Math.max(best, currentStreak),
      total_study_time_minutes: totalStudyTimeMinutes,
      is_active_today: hasStudiedToday
    };
  }
}
