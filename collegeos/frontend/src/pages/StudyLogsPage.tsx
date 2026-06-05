import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen, 
  X, 
  Calendar as CalendarIcon,
  Filter,
  FileText
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  course_code: string;
  color: string;
}

interface StudyLog {
  id: string;
  subject_id: string | null;
  task_id: string | null;
  session_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes: string | null;
  subject_name?: string;
  subject_color?: string;
  task_title?: string;
}

export function StudyLogsPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Filtering
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  
  // Manual Log Dialog
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [sessionType, setSessionType] = useState("Focus");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchSubjects();
  }, [selectedSubjectId]);

  async function fetchLogs() {
    try {
      const params: any = {};
      if (selectedSubjectId !== "all") {
        params.subject_id = selectedSubjectId;
      }
      const response = await apiClient.get<StudyLog[]>("/study/logs", { params });
      setLogs(response.data);
    } catch (err) {
      console.error("Error fetching study logs:", err);
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

  async function handleCreateLog(e: React.FormEvent) {
    e.preventDefault();
    if (!startTime || !endTime || !sessionType) return;

    try {
      const payload = {
        subject_id: subjectId || null,
        session_type: sessionType,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        notes: notes.trim() || undefined
      };

      await apiClient.post("/study/logs", payload);
      fetchLogs();
      setIsAddingLog(false);
      resetForm();
    } catch (err) {
      console.error("Error creating study log manually:", err);
    }
  }

  async function handleDeleteLog(id: string) {
    if (!confirm("Are you sure you want to delete this study log entry?")) return;
    try {
      await apiClient.delete(`/study/logs/${id}`);
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting study log:", err);
    }
  }

  function resetForm() {
    setStartTime("");
    setEndTime("");
    setNotes("");
    setSessionType("Focus");
    if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
    } else {
      setSubjectId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Logs</h1>
          <p className="text-sm text-zinc-400 mt-1">Review and manage your complete historical focus hours.</p>
        </div>
        
        <button
          onClick={() => setIsAddingLog(true)}
          className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 font-semibold text-zinc-950 hover:bg-sky-400 transition"
        >
          <Plus size={18} /> Manual Log
        </button>
      </div>

      {/* Filtering Toolbar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 flex items-center justify-between">
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 w-72">
          <Filter size={14} className="text-zinc-500 mr-2" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer w-full"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Subject</th>
                <th className="p-4">Session Type</th>
                <th className="p-4">Date / Time</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No study logs recorded yet. Run the timer or click Manual Log to submit.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: log.subject_color ?? "#71717a" }} />
                      {log.subject_name || "Self Study"}
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-zinc-800 px-2 py-1 rounded-md text-zinc-300 border border-zinc-700">
                        {log.session_type}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(log.start_time).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-sky-400">
                      {log.duration_minutes} mins
                    </td>
                    <td className="p-4 text-xs text-zinc-400 max-w-xs truncate" title={log.notes || ""}>
                      {log.notes || <span className="italic text-zinc-600">No notes</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete Log Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MANUAL LOG ENTRY */}
      {isAddingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
                <Clock size={18} className="text-sky-400" /> Manually Log Study Hours
              </h3>
              <button onClick={() => setIsAddingLog(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="">No Subject (General study)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                >
                  <option value="Focus">Focus Session</option>
                  <option value="Revision">Revision</option>
                  <option value="Assignment">Assignment Work</option>
                  <option value="Exam Prep">Exam Prep</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Date / Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">End Date / Time</label>
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
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Completed questions 4-10 in chapter 2..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500 min-h-[80px]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Log Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
