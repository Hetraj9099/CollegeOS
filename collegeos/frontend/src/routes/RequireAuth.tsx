import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export function RequireAuth() {
  const { authenticated, initialized, hasUser } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500 font-medium text-sm">
        Loading workspace...
      </div>
    );
  }

  if (!hasUser) {
    return <Navigate to="/setup" replace />;
  }

  if (!authenticated) {
    return <Navigate to="/unlock" replace />;
  }

  return <Outlet />;
}

