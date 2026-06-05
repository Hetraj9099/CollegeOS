import { NavLink } from "react-router-dom";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";
import logoSvg from "@/assets/collegeos-logo.svg";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Clock,
  Timer,
  History,
  GraduationCap,
  BarChart2,
  Settings,
  Lock
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/timetable", label: "Timetable", icon: Clock },
  { to: "/study/timer", label: "Study Timer", icon: Timer },
  { to: "/study/logs", label: "Study Logs", icon: History },
  { to: "/grades", label: "Grades & GPA", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Navigation() {
  const { setAuthState } = useAuthStore();

  async function handleLogout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAuthState({
        hasUser: true,
        authenticated: false,
        initialized: true
      });
    }
  }

  return (
    <div className="flex h-full flex-col justify-between bg-transparent">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <img src={logoSvg} alt="CollegeOS Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-zinc-50">CollegeOS</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-800 text-sky-400 shadow-inner"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`
                }
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Lock Button */}
      <div className="pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition duration-150"
        >
          <Lock size={18} />
          Lock Workspace
        </button>
      </div>
    </div>
  );
}
