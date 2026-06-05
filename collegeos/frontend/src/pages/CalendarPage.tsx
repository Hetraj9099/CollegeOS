import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { apiClient } from "@/services/api-client";
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  FileText, 
  Trash2, 
  CheckSquare, 
  MapPin, 
  User, 
  GraduationCap
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  event_type: "EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS";
  related_task_id: string | null;
  is_task?: boolean;
  completed?: boolean;
}

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState<"EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS">("PERSONAL");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await apiClient.get<CalendarEvent[]>("/calendar");
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;
    
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        event_type: eventType
      };

      await apiClient.post("/calendar", payload);
      fetchEvents();
      setIsAddingEvent(false);
      resetForm();
    } catch (err) {
      console.error("Error creating calendar event:", err);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await apiClient.delete(`/calendar/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting calendar event:", err);
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setEventType("PERSONAL");
  }

  const getEventBgColor = (type: string, isTask?: boolean, completed?: boolean) => {
    if (isTask) {
      return completed ? "#10b981" : "#f59e0b";
    }
    switch (type) {
      case "EXAM": return "#f43f5e"; // Rose
      case "ASSIGNMENT": return "#a855f7"; // Purple
      case "STUDY": return "#0ea5e9"; // Sky
      case "CLASS": return "#6366f1"; // Indigo
      default: return "#71717a"; // Zinc
    }
  };

  // Convert API events to FullCalendar event format
  const fcEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    backgroundColor: getEventBgColor(e.event_type, e.is_task, e.completed),
    borderColor: "transparent",
    extendedProps: e
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage academic schedules, exams, and personal events.</p>
        </div>
        <button
          onClick={() => setIsAddingEvent(true)}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 font-semibold text-zinc-950 hover:bg-sky-400 transition"
        >
          <Plus size={18} /> Schedule Event
        </button>
      </div>

      {/* Calendar Grid card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
        <div className="fc-dark-theme-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek"
            }}
            events={fcEvents}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.5}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
              hour12: false
            }}
          />
        </div>
      </div>

      {/* Color Guide Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-zinc-900/20 border border-zinc-800 rounded-xl">
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-rose-500" /> Exam
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-purple-500" /> Assignment
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-sky-500" /> Study Session
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-indigo-500" /> Class
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-zinc-500" /> Personal
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-amber-500" /> Pending Task
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="h-3 w-3 rounded bg-emerald-500" /> Completed Task
        </div>
      </div>

      {/* MODAL: ADD EVENT */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
                <CalendarIcon size={18} className="text-sky-400" /> Schedule Calendar Event
              </h3>
              <button onClick={() => setIsAddingEvent(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="CS101 Mid-Sem Exam"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, location or syllabus..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="PERSONAL">Personal Event</option>
                  <option value="CLASS">Class</option>
                  <option value="STUDY">Study Session</option>
                  <option value="ASSIGNMENT">Assignment Due</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Schedule Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW/EDIT EVENT DETAILS */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                selectedEvent.is_task 
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : selectedEvent.event_type === "EXAM"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
              }`}>
                {selectedEvent.is_task ? "TASK" : selectedEvent.event_type}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-zinc-50">{selectedEvent.title}</h3>
              
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CalendarIcon size={14} />
                <span>
                  {new Date(selectedEvent.start_time).toLocaleString()} - {new Date(selectedEvent.end_time).toLocaleString()}
                </span>
              </div>

              {selectedEvent.description && (
                <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 text-sm text-zinc-300">
                  <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.is_task ? (
                <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                  <CheckSquare size={14} className="text-amber-400" />
                  <span>This event represents a task. Complete or edit it in the Tasks dashboard.</span>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 transition"
                  >
                    <Trash2 size={14} /> Delete Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
