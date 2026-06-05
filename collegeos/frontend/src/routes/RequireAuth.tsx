import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export function RequireAuth() {
  const { initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-500 font-medium text-sm">
        Loading workspace...
      </div>
    );
  }

  return <Outlet />;
}

