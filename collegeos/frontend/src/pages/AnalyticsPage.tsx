import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  Award,
  BookOpen
} from "lucide-react";

interface StudyTrendPoint {
  date: string;
  minutes: number;
}

interface SubjectAllocationPoint {
  subject_id: string;
  subject_name: string;
  subject_color: string;
  minutes: number;
  percentage: number;
}

interface GpaTrendPoint {
  semester_id: string;
  semester_number: number;
  academic_year: string;
  sgpa: number | null;
  cgpa: number | null;
}

interface ProductivitySummary {
  total_study_time_minutes: number;
  average_session_minutes: number;
  total_sessions_completed: number;
  highest_daily_study_minutes: number;
}

interface AnalyticsData {
  study_trends: StudyTrendPoint[];
  subject_allocations: SubjectAllocationPoint[];
  gpa_trends: GpaTrendPoint[];
  productivity: ProductivitySummary;
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const response = await apiClient.get<AnalyticsData>(`/analytics?tzOffset=${tzOffset}`);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    }
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        <Activity className="animate-spin mr-2" />
        <span>Loading analytics dashboard...</span>
      </div>
    );
  }

  const { study_trends, subject_allocations, gpa_trends, productivity } = data;

  const totalStudyHours = Math.round(productivity.total_study_time_minutes / 60);
  const totalStudyMinutes = productivity.total_study_time_minutes % 60;

  const maxHours = Math.round(productivity.highest_daily_study_minutes / 60);
  const maxMinutes = productivity.highest_daily_study_minutes % 60;

  // Formatting date labels (e.g. 2026-06-05 -> Jun 5)
  const formatTrendData = study_trends.map(t => {
    const d = new Date(t.date + "T00:00:00");
    return {
      ...t,
      dateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    };
  });

  const formatGpaData = gpa_trends.map(g => ({
    ...g,
    semLabel: `Sem ${g.semester_number}`
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-400 mt-1">Review visual study patterns and semester GPA trends.</p>
      </div>

      {/* Grid: Productivity Summaries */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="rounded-xl bg-sky-500/10 p-3 border border-sky-500/20 text-sky-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Studied</span>
            <span className="text-xl font-bold text-zinc-100">{totalStudyHours}h {totalStudyMinutes}m</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="rounded-xl bg-indigo-500/10 p-3 border border-indigo-500/20 text-indigo-400">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Sessions Count</span>
            <span className="text-xl font-bold text-zinc-100">{productivity.total_sessions_completed} sessions</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="rounded-xl bg-purple-500/10 p-3 border border-purple-500/20 text-purple-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Average Focus</span>
            <span className="text-xl font-bold text-zinc-100">{productivity.average_session_minutes} mins</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md flex items-center gap-4">
          <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-amber-400">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Daily Record</span>
            <span className="text-xl font-bold text-zinc-100">{maxHours}h {maxMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Study Trends (Bar Chart) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Clock size={16} /> Daily Study Durations (Last 30 Days)
          </h3>
          <div className="h-64">
            {formatTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">No study hours recorded in the last 30 days.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="dateLabel" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }}
                    labelStyle={{ color: "#f4f4f5", fontWeight: "bold" }}
                  />
                  <Bar dataKey="minutes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Subject Allocations (Pie Chart) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <BookOpen size={16} /> Time Distribution by Course
          </h3>
          <div className="grid sm:grid-cols-2 items-center">
            <div className="h-56">
              {subject_allocations.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">No subject records logged.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subject_allocations}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="minutes"
                    >
                      {subject_allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.subject_color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }}
                      formatter={(val: number) => [`${val} mins`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Legend */}
            <div className="space-y-2 overflow-y-auto max-h-56 pr-2">
              {subject_allocations.map((alloc) => (
                <div key={alloc.subject_id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: alloc.subject_color }} />
                    <span className="font-medium text-zinc-200">{alloc.subject_name}</span>
                  </div>
                  <span className="text-zinc-400 font-semibold">{alloc.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: GPA Progression (Line Chart) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Award size={16} /> Academic Performance (SGPA & CGPA Trends)
          </h3>
          <div className="h-64">
            {formatGpaData.filter(g => g.sgpa !== null).length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">Configure GPAs in semesters to display line charts.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatGpaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="semLabel" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
