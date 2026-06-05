import { AnalyticsRepository } from "./repository.js";
import type { AnalyticsDashboardData } from "./types.js";

export class AnalyticsService {
  constructor(private readonly repository = new AnalyticsRepository()) {}

  async getDashboardData(timezoneOffsetMinutes: number = 0): Promise<AnalyticsDashboardData> {
    const [studyTrends, subjectAllocations, gpaTrends, productivity] = await Promise.all([
      this.repository.getStudyTrends(timezoneOffsetMinutes),
      this.repository.getSubjectAllocations(),
      this.repository.getGpaTrends(),
      this.repository.getProductivitySummary(timezoneOffsetMinutes)
    ]);

    return {
      study_trends: studyTrends,
      subject_allocations: subjectAllocations,
      gpa_trends: gpaTrends,
      productivity
    };
  }
}
