import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  BookOpen, 
  X, 
  Calendar as CalendarIcon,
  ChevronRight
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  course_code: string;
  color: string;
}

interface TimetableEntry {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  classroom: string | null;
  subject_name: string;
  subject_color: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" }
];

export function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1); // Monday by default
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Form states
  const [subjectId, setSubjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [classroom, setClassroom] = useState("");

  useEffect(() => {
    fetchEntries();
    fetchSubjects();
  }, []);

  async function fetchEntries() {
    try {
      const response = await apiClient.get<TimetableEntry[]>("/timetable");
      setEntries(response.data);
    } catch (err) {
      console.error("Error fetching timetable entries:", err);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await apiClient.get<Subject[]>("/subjects");
      setSubjects(response.data);
      if (response.data.length > 0) {
        setSubjectId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }

  async function handleCreateEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !startTime || !endTime) return;

    try {
      const payload = {
        subject_id: subjectId,
        day_of_week: Number(dayOfWeek),
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        classroom: classroom.trim() || undefined
      };

      await apiClient.post("/timetable", payload);
      fetchEntries();
      setIsAddingEntry(false);
      resetForm();
    } catch (err) {
      console.error("Error creating timetable entry:", err);
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm("Are you sure you want to delete this class entry?")) return;
    try {
      await apiClient.delete(`/timetable/${id}`);
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      console.error("Error deleting timetable entry:", err);
    }
  }

  function resetForm() {
    setClassroom("");
    setStartTime("09:00");
    setEndTime("10:00");
    setDayOfWeek(1);
    if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }

  const formatTime = (timeStr: string) => {
    // Splits HH:MM:SS to HH:MM
    return timeStr.substring(0, 5);
  };

  const getDayEntries = (day: number) => {
    return entries.filter(e => e.day_of_week === day);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-sm text-zinc-400 mt-1">Organize your weekly class schedule and classrooms.</p>
        </div>
        {subjects.length > 0 && (
          <button
            onClick={() => setIsAddingEntry(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 font-semibold text-zinc-950 hover:bg-sky-400 transition"
          >
            <Plus size={18} /> Add Class
          </button>
        )}
      </div>

      {subjects.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm text-amber-400">
          You need to add subjects under the <strong>Grades & GPA</strong> page before configuring your timetable.
        </div>
      )}

      {/* Weekday Tab Selector */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-zinc-900/40 border border-zinc-800 rounded-2xl backdrop-blur-md">
        {DAYS_OF_WEEK.map((day) => {
          const count = getDayEntries(day.value).length;
          return (
            <button
              key={day.value}
              onClick={() => setActiveTab(day.value)}
              className={`flex-1 shrink-0 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === day.value
                  ? "bg-zinc-800 text-sky-400 shadow-inner"
                  : "text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200"
              }`}
            >
              {day.label}
              {count > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Agenda Listings */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Day Classes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-1 text-zinc-200">
            <CalendarIcon size={18} className="text-sky-400" />
            {DAYS_OF_WEEK.find(d => d.value === activeTab)?.label} Schedule
          </h2>

          <div className="space-y-3">
            {getDayEntries(activeTab).length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                <Clock size={32} className="mb-2 text-zinc-600 animate-pulse" />
                <p className="text-sm">No classes scheduled for this day.</p>
              </div>
            ) : (
              getDayEntries(activeTab).map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/60 transition"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Color Strip */}
                    <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: entry.subject_color }} />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-50 flex items-center gap-2">
                        {entry.subject_name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-zinc-500" />
                          {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                        </span>
                        {entry.classroom && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-zinc-500" />
                            Classroom: {entry.classroom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Class"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Summary Checklist Side Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-1 text-zinc-200">
            <BookOpen size={18} className="text-sky-400" />
            Weekly Summary
          </h2>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4 backdrop-blur-md text-sm text-zinc-300">
            <p>
              Your total weekly load is <strong>{entries.length} scheduled class blocks</strong>.
            </p>
            <div className="space-y-2.5">
              {DAYS_OF_WEEK.map((d) => {
                const count = getDayEntries(d.value).length;
                if (count === 0) return null;
                return (
                  <div key={d.value} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/40">
                    <span className="font-medium">{d.label}</span>
                    <span className="text-zinc-400">{count} class{count > 1 ? "es" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD CLASS ENTRY */}
      {isAddingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
                <Clock size={18} className="text-sky-400" /> Schedule Weekly Class
              </h3>
              <button onClick={() => setIsAddingEntry(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Classroom / Location</label>
                <input
                  type="text"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  placeholder="LHC Seminar Room 2"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Add Class to Timetable
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
