import { CalendarRepository } from "./repository.js";
import { TasksRepository } from "../tasks/repository.js";
import type { CreateCalendarEventPayload, UpdateCalendarEventPayload } from "./types.js";

export class CalendarService {
  constructor(
    private readonly repository = new CalendarRepository(),
    private readonly tasksRepository = new TasksRepository()
  ) {}

  async listEvents(startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Fetch calendar events
    const events = await this.repository.listEvents(startDate, endDate);

    // Fetch tasks with due dates in the range
    const tasks = await this.tasksRepository.listTasks({});
    
    // Filter tasks that have due dates and fall in range
    const taskEvents = tasks
      .filter(task => {
        if (!task.due_date) return false;
        const d = new Date(task.due_date);
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      })
      .map(task => {
        const start = new Date(task.due_date!);
        // Set end time 1 hour after start time for visual rendering
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        
        return {
          id: `task-${task.id}`,
          title: `[Task] ${task.title}`,
          description: task.description,
          start_time: start,
          end_time: end,
          event_type: task.priority === "HIGH" ? "EXAM" : "ASSIGNMENT",
          related_task_id: task.id,
          completed: task.completed,
          is_task: true,
          created_at: task.created_at,
          updated_at: task.updated_at
        };
      });

    // Merge and sort chronologically
    const merged = [...events, ...taskEvents];
    merged.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return merged;
  }

  async createEvent(payload: CreateCalendarEventPayload) {
    return this.repository.create(payload);
  }

  async getEvent(id: string) {
    return this.repository.findById(id);
  }

  async updateEvent(id: string, payload: UpdateCalendarEventPayload) {
    return this.repository.update(id, payload);
  }

  async deleteEvent(id: string) {
    return this.repository.delete(id);
  }
}
