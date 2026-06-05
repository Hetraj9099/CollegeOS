import { TasksRepository } from "./repository.js";

export class TasksService {
  constructor(private readonly repository = new TasksRepository()) {
    void this.repository;
  }
}
