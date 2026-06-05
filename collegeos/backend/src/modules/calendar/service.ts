import { CalendarRepository } from "./repository.js";

export class CalendarService {
  constructor(private readonly repository = new CalendarRepository()) {
    void this.repository;
  }
}
