import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Navigation } from "@/components/common/Navigation";
import { Menu, X } from "lucide-react";
import logoPng from "@/assets/collegeos-logo.png";

export function AppLayout({ children }: PropsWithChildren) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-64 border-r border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md md:block z-30">
        <Navigation />
      </aside>

      {/* Header for Mobile only */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-6 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <img src={logoPng} alt="CollegeOS Logo" className="h-7 w-7 object-contain" />
          <span className="text-lg font-bold tracking-tight">CollegeOS</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-zinc-200"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed bottom-0 top-0 z-50 w-64 border-r border-zinc-800 bg-zinc-900 p-4 transition-all duration-300 md:hidden ${
          mobileMenuOpen ? "left-0" : "-left-64"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Navigation />
      </div>

      {/* Main Page Content */}
      <div className="md:pl-64 min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
