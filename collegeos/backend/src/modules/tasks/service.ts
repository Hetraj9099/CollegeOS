import { TasksRepository } from "./repository.js";
import type { CreateTaskListPayload, CreateTaskPayload, UpdateTaskPayload } from "./types.js";

export class TasksService {
  constructor(private readonly repository = new TasksRepository()) {}

  async listLists() {
    return this.repository.listLists();
  }

  async createList(payload: CreateTaskListPayload) {
    return this.repository.createList(payload);
  }

  async deleteList(id: string) {
    return this.repository.deleteList(id);
  }

  async listTasks(filters: {
    list_id?: string;
    subject_id?: string;
    status?: string;
    q?: string;
    sortBy?: string;
  }) {
    return this.repository.listTasks(filters);
  }

  async getTask(id: string) {
    return this.repository.findTaskById(id);
  }

  async createTask(payload: CreateTaskPayload) {
    return this.repository.createTask(payload);
  }

  async updateTask(id: string, payload: UpdateTaskPayload) {
    return this.repository.updateTask(id, payload);
  }

  async deleteTask(id: string) {
    return this.repository.deleteTask(id);
  }
}
