import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Flame, 
  Clock, 
  GraduationCap,
  Timer,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";

interface CgpaGoal {
  current_cgpa: number;
  target_cgpa: number;
}

interface CgpaFeasibility {
  goal: CgpaGoal | null;
}

interface Semester {
  id: string;
  semester_number: number;
  sgpa: number | null;
}

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  event_type: "EXAM" | "ASSIGNMENT" | "STUDY" | "PERSONAL" | "CLASS";
}

interface StreakSummary {
  current_streak: number;
  best_streak: number;
}

interface ProductivitySummary {
  total_study_time_minutes: number;
}

interface AnalyticsData {
  productivity: ProductivitySummary;
}

export function DashboardPage() {
  const [goal, setGoal] = useState<CgpaGoal | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const tzOffset = new Date().getTimezoneOffset();
      
      const [cgpaRes, semRes, taskRes, calRes, streakRes, analyticsRes] = await Promise.all([
        apiClient.get<CgpaFeasibility>("/cgpa"),
        apiClient.get<Semester[]>("/semesters"),
        apiClient.get<Task[]>("/tasks"),
        apiClient.get<CalendarEvent[]>("/calendar"),
        apiClient.get<StreakSummary>(`/study/streak?tzOffset=${tzOffset}`),
        apiClient.get<AnalyticsData>(`/analytics?tzOffset=${tzOffset}`)
      ]);

      setGoal(cgpaRes.data.goal);
      setSemesters(semRes.data);
      setTasks(taskRes.data);
      setEvents(calRes.data);
      setStreak(streakRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }

  // Derived metrics
  const latestSgpa = semesters.length > 0 
    ? semesters.filter(s => s.sgpa !== null).sort((a, b) => b.semester_number - a.semester_number)[0]?.sgpa ?? null 
    : null;

  // Tasks due today
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => {
    if (!t.due_date || t.completed) return false;
    return t.due_date.split("T")[0] === todayStr;
  });

  // Upcoming Exams and Assignments
  const upcomingAcademics = events.filter(e => {
    const isAcademic = e.event_type === "EXAM" || e.event_type === "ASSIGNMENT";
    const isFuture = new Date(e.start_time).getTime() > Date.now();
    return isAcademic && isFuture;
  }).slice(0, 3);

  // Study times
  const totalStudiedMins = analytics?.productivity.total_study_time_minutes ?? 0;
  const studyHours = Math.round(totalStudiedMins / 60);
  const studyMins = totalStudiedMins % 60;

  return (
    <div className="space-y-6">
      
      {/* Brand Header Welcome */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">Command Center</h1>
          <p className="text-sm text-zinc-400">Welcome back! Here is a summary of your workspace today.</p>
        </div>
        
        {/* Quick Navigate Links */}
        <div className="flex gap-2.5">
          <Link
            to="/study/timer"
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 font-bold text-zinc-950 text-xs transition shadow-lg shadow-sky-500/10"
          >
            <Timer size={14} /> Start Study Session
          </Link>
        </div>
      </div>

      {/* Grid: Primary KPI Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Streak */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Study Streak</span>
            <span className="text-xl font-bold text-zinc-100">{streak?.current_streak ?? 0} days</span>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-amber-400">
            <Flame size={20} />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Today's Tasks</span>
            <span className="text-xl font-bold text-zinc-100">{todayTasks.length} pending</span>
          </div>
          <div className="rounded-xl bg-sky-500/10 p-3 border border-sky-500/20 text-sky-400">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Study Hours */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Study Hours</span>
            <span className="text-xl font-bold text-zinc-100">{studyHours}h {studyMins}m</span>
          </div>
          <div className="rounded-xl bg-indigo-500/10 p-3 border border-indigo-500/20 text-indigo-400">
            <Clock size={20} />
          </div>
        </div>

        {/* GPA status */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Target CGPA</span>
            <span className="text-xl font-bold text-zinc-100">
              {goal ? `${Number(goal.target_cgpa).toFixed(2)}` : "N/A"}
              {latestSgpa && (
                <span className="text-xs text-zinc-400 font-normal ml-1.5">(SGPA: {latestSgpa})</span>
              )}
            </span>
          </div>
          <div className="rounded-xl bg-purple-500/10 p-3 border border-purple-500/20 text-purple-400">
            <GraduationCap size={20} />
          </div>
        </div>
      </div>

      {/* Columns details */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Left Column: Tasks due today */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={16} className="text-sky-400" /> Due Today
            </h3>
            <Link to="/tasks" className="text-xs text-sky-400 hover:text-sky-300 flex items-center">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No pending tasks due today. You are all set!</p>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    t.priority === "HIGH" ? "bg-rose-500" : t.priority === "MEDIUM" ? "bg-amber-500" : "bg-sky-500"
                  }`} />
                  <span className="text-xs text-zinc-200 font-medium">{t.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming deadlines/exams */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon size={16} className="text-sky-400" /> Upcoming Exams & Deadlines
            </h3>
            <Link to="/calendar" className="text-xs text-sky-400 hover:text-sky-300 flex items-center">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2">
            {upcomingAcademics.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No upcoming academic deadlines or exams.</p>
            ) : (
              upcomingAcademics.map((e) => (
                <div key={e.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      e.event_type === "EXAM" ? "bg-rose-500" : "bg-purple-500"
                    }`} />
                    <span className="text-xs text-zinc-200 font-medium">{e.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{new Date(e.start_time).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
