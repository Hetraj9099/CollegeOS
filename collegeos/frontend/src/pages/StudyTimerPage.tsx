import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/services/api-client";
import { 
  Play, 
  Square, 
  Clock, 
  Flame, 
  BookOpen, 
  CheckSquare, 
  AlertCircle,
  FileText
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  course_code: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  subject_id: string | null;
}

interface ActiveSession {
  id: string;
  subject_id: string | null;
  task_id: string | null;
  session_type: string;
  start_time: string;
  subject_name?: string;
  subject_color?: string;
  task_title?: string;
}

interface StreakSummary {
  current_streak: number;
  best_streak: number;
  total_study_time_minutes: number;
  is_active_today: boolean;
}

export function StudyTimerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [streak, setStreak] = useState<StreakSummary | null>(null);

  // Form states (Inactive timer)
  const [subjectId, setSubjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [sessionType, setSessionType] = useState("Focus");

  // Stop session states
  const [notes, setNotes] = useState("");
  const [isStopping, setIsStopping] = useState(false);

  // Ticking visual states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchActiveSession();
    fetchSubjects();
    fetchTasks();
    fetchStreak();
    return () => stopVisualTimer();
  }, []);

  useEffect(() => {
    if (activeSession) {
      startVisualTimer(activeSession.start_time);
    } else {
      stopVisualTimer();
      setElapsedSeconds(0);
    }
  }, [activeSession]);

  async function fetchActiveSession() {
    try {
      const response = await apiClient.get<ActiveSession | null>("/study/active");
      setActiveSession(response.data);
    } catch (err) {
      console.error("Error fetching active session:", err);
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

  async function fetchTasks() {
    try {
      // Fetch incomplete tasks
      const response = await apiClient.get<Task[]>("/tasks?status=TODO");
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  async function fetchStreak() {
    try {
      // Pass the client's timezone offset
      const tzOffset = new Date().getTimezoneOffset();
      const response = await apiClient.get<StreakSummary>(`/study/streak?tzOffset=${tzOffset}`);
      setStreak(response.data);
    } catch (err) {
      console.error("Error fetching streak summary:", err);
    }
  }

  // Visual stopwatch ticking logic
  function startVisualTimer(startTimeStr: string) {
    stopVisualTimer();
    const startTime = new Date(startTimeStr).getTime();
    
    // Initial calculate
    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diff);
    };

    updateElapsed();
    timerRef.current = setInterval(updateElapsed, 1000);
  }

  function stopVisualTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Actions
  async function handleStartTimer() {
    try {
      const payload = {
        subject_id: subjectId || null,
        task_id: taskId || null,
        session_type: sessionType,
        start_time: new Date().toISOString()
      };

      const response = await apiClient.post<ActiveSession>("/study/start", payload);
      setActiveSession(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not start timer");
    }
  }

  async function handleStopTimer() {
    if (!activeSession) return;
    setIsStopping(true);
    try {
      const payload = {
        end_time: new Date().toISOString(),
        notes: notes.trim() || null
      };

      await apiClient.post("/study/stop", payload);
      setActiveSession(null);
      setNotes("");
      setIsStopping(false);
      fetchStreak();
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not stop timer");
      setIsStopping(false);
    }
  }

  const formatElapsedTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Timer</h1>
        <p className="text-sm text-zinc-400 mt-1">Track and logs your academic focus sessions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Streak Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4 text-center">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Flame size={14} className="text-amber-500" />
              Streak Metrics
            </h2>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex items-center gap-2 text-5xl font-extrabold text-amber-500 drop-shadow-md">
                <span>{streak?.current_streak ?? 0}</span>
                <Flame size={44} className="animate-bounce" />
              </div>
              <span className="text-xs text-zinc-400 mt-2 font-medium">Current Streak (Days)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 text-left">
              <div className="px-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Best Streak</span>
                <span className="text-base font-semibold text-zinc-200">{streak?.best_streak ?? 0} days</span>
              </div>
              <div className="px-2 border-l border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Studied</span>
                <span className="text-base font-semibold text-zinc-200">
                  {Math.round((streak?.total_study_time_minutes ?? 0) / 60)}h { (streak?.total_study_time_minutes ?? 0) % 60 }m
                </span>
              </div>
            </div>

            {streak?.is_active_today ? (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                Streak active! studied ≥30m today.
              </div>
            ) : (
              <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 py-2 rounded-xl flex items-center justify-center gap-1.5">
                <AlertCircle size={14} className="text-zinc-500" />
                Study 30m today to lock streak.
              </div>
            )}
          </div>
        </div>

        {/* Timer Panel */}
        <div className="md:col-span-2">
          {activeSession ? (
            /* ACTIVE TIMER PANEL */
            <div className="rounded-2xl border border-sky-500/30 bg-zinc-900/60 p-8 backdrop-blur-md text-center timer-active-pulse space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
                  SESSION RUNNING ({activeSession.session_type})
                </span>
                <h3 className="text-2xl font-bold mt-4 text-zinc-100">
                  {activeSession.subject_name || "Self Study"}
                </h3>
                {activeSession.task_title && (
                  <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mt-1">
                    <CheckSquare size={12} /> Working on: {activeSession.task_title}
                  </p>
                )}
              </div>

              {/* Ticking Clock */}
              <div className="text-6xl font-extrabold tracking-widest text-zinc-50 font-mono py-4">
                {formatElapsedTime(elapsedSeconds)}
              </div>

              {/* Stop & Notes Drawer */}
              <div className="max-w-md mx-auto space-y-3 pt-4 border-t border-zinc-800">
                <textarea
                  placeholder="What did you focus on? Notes will save in study log..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500 min-h-[70px] resize-none"
                />
                
                <button
                  onClick={handleStopTimer}
                  disabled={isStopping}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 py-3 font-semibold text-zinc-950 transition disabled:opacity-50"
                >
                  <Square size={16} fill="currentColor" /> Stop Focus Session
                </button>
              </div>
            </div>
          ) : (
            /* TIMER CONFIG PANEL */
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
                <Clock size={18} className="text-sky-400" /> Start Focus Session
              </h2>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      setTaskId("");
                    }}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="">No Subject (General Personal study)</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Related Task</label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="">No specific task linked</option>
                    {tasks
                      .filter(t => !t.subject_id || t.subject_id === subjectId)
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Session Type</label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    >
                      <option value="Focus">Focus Session</option>
                      <option value="Revision">Revision</option>
                      <option value="Assignment">Assignment Work</option>
                      <option value="Exam Prep">Exam Prep</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={handleStartTimer}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 py-2.5 font-bold text-zinc-950 transition"
                    >
                      <Play size={16} fill="currentColor" /> Start Timer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
