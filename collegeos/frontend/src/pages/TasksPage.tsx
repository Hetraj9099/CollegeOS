import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  ListTodo, 
  FolderPlus, 
  Calendar as CalendarIcon, 
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown
} from "lucide-react";

interface TaskList {
  id: string;
  name: string;
  color: string;
}

interface Subject {
  id: string;
  semester_id: string;
  name: string;
  course_code: string;
  color: string;
}

interface Semester {
  id: string;
  semester_number: number;
}

interface Task {
  id: string;
  list_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
}

export function TasksPage() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Selection
  const [selectedListId, setSelectedListId] = useState<string>("all");
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_desc");
  
  // Modals / Inputs
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("#38bdf8");
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [newTaskTargetListId, setNewTaskTargetListId] = useState("");
  const [newTaskSubjectId, setNewTaskSubjectId] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load Lists & Tasks
  useEffect(() => {
    fetchLists();
    fetchSubjects();
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedListId, searchQuery, statusFilter, sortBy]);

  async function fetchLists() {
    try {
      const response = await apiClient.get<TaskList[]>("/tasks/lists");
      setLists(response.data);
      if (response.data.length > 0 && !newTaskTargetListId) {
        setNewTaskTargetListId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching task lists:", err);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await apiClient.get<Subject[]>("/subjects");
      setSubjects(response.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }

  async function fetchSemesters() {
    try {
      const response = await apiClient.get<Semester[]>("/semesters");
      setSemesters(response.data);
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  }

  async function fetchTasks() {
    try {
      const params: any = {};
      if (selectedListId !== "all") {
        params.list_id = selectedListId;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchQuery.trim() !== "") {
        params.q = searchQuery;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }
      const response = await apiClient.get<Task[]>("/tasks", { params });
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  // Handle List Actions
  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const response = await apiClient.post<TaskList>("/tasks/lists", {
        name: newListName.trim(),
        color: newListColor
      });
      setLists([...lists, response.data]);
      setNewListName("");
      setIsAddingList(false);
      if (!newTaskTargetListId) {
        setNewTaskTargetListId(response.data.id);
      }
    } catch (err) {
      console.error("Error creating task list:", err);
    }
  }

  async function handleDeleteList(id: string) {
    if (!confirm("Are you sure you want to delete this list and all its tasks?")) return;
    try {
      await apiClient.delete(`/tasks/lists/${id}`);
      setLists(lists.filter(l => l.id !== id));
      if (selectedListId === id) {
        setSelectedListId("all");
      }
      if (newTaskTargetListId === id) {
        const remaining = lists.filter(l => l.id !== id);
        setNewTaskTargetListId(remaining.length > 0 ? remaining[0].id : "");
      }
    } catch (err) {
      console.error("Error deleting task list:", err);
    }
  }

  // Handle Task Actions
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskTargetListId) return;
    try {
      const payload = {
        list_id: newTaskTargetListId,
        subject_id: newTaskSubjectId || null,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        priority: newTaskPriority,
        status: newTaskStatus,
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null
      };
      await apiClient.post("/tasks", payload);
      fetchTasks();
      // Reset
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("MEDIUM");
      setNewTaskDueDate("");
      setNewTaskStatus("TODO");
      setNewTaskSubjectId("");
      setIsAddingTask(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      const nextCompleted = !task.completed;
      await apiClient.put(`/tasks/${task.id}`, { completed: nextCompleted });
      fetchTasks();
    } catch (err) {
      console.error("Error toggling task completion:", err);
    }
  }

  async function handleUpdateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    try {
      const payload = {
        list_id: editingTask.list_id,
        subject_id: editingTask.subject_id,
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString() : null
      };
      await apiClient.put(`/tasks/${editingTask.id}`, payload);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      if (editingTask?.id === id) setEditingTask(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }

  // Derive latest semester subjects
  const latestSemester = semesters.reduce((latest, curr) =>
    !latest || curr.semester_number > latest.semester_number ? curr : latest
  , null as Semester | null);
  const filteredSubjects = latestSemester
    ? subjects.filter(s => s.semester_id === latestSemester.id)
    : subjects;

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case "HIGH": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
  };

  const getStatusBadgeColor = (s: string) => {
    switch (s) {
      case "DONE": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "IN_PROGRESS": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      default: return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 md:flex-row">
      
      {/* Sidebar: Lists panel */}
      <div className="w-full shrink-0 md:w-64 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <ListTodo size={16} /> Task Lists
            </h2>
            <button
              onClick={() => setIsAddingList(!isAddingList)}
              className="text-zinc-400 hover:text-zinc-200"
              title="Add New List"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          {/* Inline List Creator */}
          {isAddingList && (
            <form onSubmit={handleCreateList} className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List Name..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-50 outline-none focus:border-sky-500"
                required
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {["#38bdf8", "#a855f7", "#10b981", "#f59e0b", "#f43f5e", "#a1a1aa"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewListColor(c)}
                      className={`h-4 w-4 rounded-full border transition ${newListColor === c ? "scale-125 border-white" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingList(false)}
                    className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-sky-500 px-2 py-1 text-[10px] text-zinc-950 font-bold hover:bg-sky-400"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List Entries */}
          <div className="space-y-1 overflow-y-auto max-h-[60vh]">
            <button
              onClick={() => setSelectedListId("all")}
              className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition ${
                selectedListId === "all" ? "bg-zinc-800 text-sky-400" : "text-zinc-300 hover:bg-zinc-800/40"
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-zinc-500" />
              All Tasks
              <span className="ml-auto text-xs text-zinc-500">{tasks.length}</span>
            </button>
            
            {lists.map((l) => (
              <div
                key={l.id}
                className={`flex group items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition ${
                  selectedListId === l.id ? "bg-zinc-800 text-zinc-50" : "text-zinc-300 hover:bg-zinc-800/40"
                }`}
              >
                <button
                  onClick={() => setSelectedListId(l.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </button>
                <button
                  onClick={() => handleDeleteList(l.id)}
                  className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete List"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Task Button */}
        {lists.length > 0 && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
          >
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Search, Filter, and Sort Toolbar */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
              <Filter size={14} className="text-zinc-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
              <ChevronDown size={14} className="text-zinc-500 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer"
              >
                <option value="created_desc">Newest Created</option>
                <option value="due_date_asc">Due Date (Asc)</option>
                <option value="due_date_desc">Due Date (Desc)</option>
                <option value="priority_high_first">Priority (High-Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-14rem)] pr-2">
          {tasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <ListTodo size={32} className="mb-2 text-zinc-600" />
              <p className="text-sm">No tasks found. Create a task list and add some items!</p>
            </div>
          ) : (
            tasks.map((task) => {
              const list = lists.find(l => l.id === task.list_id);
              const subject = subjects.find(s => s.id === task.subject_id);
              return (
                <div
                  key={task.id}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 hover:bg-zinc-900/60 transition"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1 flex items-center justify-center h-5 w-5 rounded-lg border transition hover:scale-105"
                      style={{ 
                        borderColor: list?.color ?? "#71717a",
                        backgroundColor: task.completed ? (list?.color ?? "#10b981") : "transparent"
                      }}
                    >
                      {task.completed && <CheckCircle size={12} className="text-zinc-950 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0" onClick={() => setEditingTask(task)}>
                      <h3 className={`font-medium text-sm text-zinc-50 truncate cursor-pointer ${task.completed ? "line-through text-zinc-500" : ""}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 truncate cursor-pointer">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {list && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: list.color }} />
                            {list.name}
                          </span>
                        )}
                        {subject && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                            <CalendarIcon size={10} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${getPriorityBadgeColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${getStatusBadgeColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: ADD TASK */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Create New Task</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Task List</label>
                <select
                  value={newTaskTargetListId}
                  onChange={(e) => setNewTaskTargetListId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                >
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Linked Subject</label>
                <select
                  value={newTaskSubjectId}
                  onChange={(e) => setNewTaskSubjectId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="">None / General Task</option>
                  {filteredSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Review assignment guidelines..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Task details..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as any)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TASK */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Task List</label>
                <select
                  value={editingTask.list_id}
                  onChange={(e) => setEditingTask({...editingTask, list_id: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                >
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Linked Subject</label>
                <select
                  value={editingTask.subject_id || ""}
                  onChange={(e) => setEditingTask({...editingTask, subject_id: e.target.value || null})}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="">None / General Task</option>
                  {(latestSemester
                    ? subjects.filter(s => s.semester_id === latestSemester.id || s.id === editingTask.subject_id)
                    : subjects
                  ).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as any})}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={editingTask.due_date ? editingTask.due_date.split("T")[0] : ""}
                  onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value || null})}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask.id)}
                  className="flex-1 rounded-xl bg-rose-500/10 border border-rose-500/20 py-3 font-semibold text-rose-400 hover:bg-rose-500 hover:text-zinc-950 transition"
                >
                  Delete Task
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
