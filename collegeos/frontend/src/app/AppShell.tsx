import { Outlet } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";

export function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
