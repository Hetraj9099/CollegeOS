import type { PropsWithChildren } from "react";
import { Navigation } from "@/components/common/Navigation";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
