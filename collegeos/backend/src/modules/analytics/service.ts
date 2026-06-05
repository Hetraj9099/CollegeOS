import { AnalyticsRepository } from "./repository.js";

export class AnalyticsService {
  constructor(private readonly repository = new AnalyticsRepository()) {
    void this.repository;
  }
}
