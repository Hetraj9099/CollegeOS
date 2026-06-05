import { useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Smartphone,
  Info
} from "lucide-react";

export function SettingsPage() {
  const [swActive, setSwActive] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure your personal workspace and preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Security Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-400" /> Security & Master Password
          </h2>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex items-center justify-between text-xs text-zinc-300">
            <div>
              <p className="font-semibold text-zinc-200">Device Master Password Hash</p>
              <p className="text-zinc-500 mt-0.5">Your data is locked using SHA-256 bcrypt hashes stored in PostgreSQL.</p>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded">
              Active & Encrypted
            </span>
          </div>
        </div>

        {/* Database & PWA */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Smartphone size={16} className="text-sky-400" /> Progressive Web App (PWA)
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs py-1">
              <div>
                <p className="font-semibold text-zinc-200">Local Service Worker</p>
                <p className="text-zinc-500 mt-0.5">Enables offline caching and asset distribution on Android and Desktop.</p>
              </div>
              <button
                type="button"
                onClick={() => setSwActive(!swActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  swActive ? "bg-sky-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                    swActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Info size={16} className="text-sky-400" /> Platform Specification
          </h2>
          <div className="divide-y divide-zinc-800/60 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">CollegeOS Release</span>
              <span className="font-medium text-zinc-300">v0.1.0-beta.1 (Skeleton Stable)</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Database Layer</span>
              <span className="font-medium text-zinc-300">PostgreSQL (Neon-Ready)</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Web Engine Stack</span>
              <span className="font-medium text-zinc-300">React 19 + Vite + Tailwind CSS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
