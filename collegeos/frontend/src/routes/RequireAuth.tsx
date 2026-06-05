import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export function RequireAuth() {
  const { initialized, isAuthenticated } = useAuthStore();

  if (!initialized) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
