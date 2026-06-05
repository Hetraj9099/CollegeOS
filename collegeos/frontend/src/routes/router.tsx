import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { GradesPage } from "@/pages/GradesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SetupPage } from "@/pages/SetupPage";
import { StudyLogsPage } from "@/pages/StudyLogsPage";
import { StudyTimerPage } from "@/pages/StudyTimerPage";
import { TasksPage } from "@/pages/TasksPage";
import { TimetablePage } from "@/pages/TimetablePage";
import { UnlockPage } from "@/pages/UnlockPage";
import { RequireAuth } from "@/routes/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/setup",
    element: <SetupPage />
  },
  {
    path: "/unlock",
    element: <UnlockPage />
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "calendar", element: <CalendarPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "timetable", element: <TimetablePage /> },
          { path: "study/timer", element: <StudyTimerPage /> },
          { path: "study/logs", element: <StudyLogsPage /> },
          { path: "grades", element: <GradesPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "settings", element: <SettingsPage /> }
        ]
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
