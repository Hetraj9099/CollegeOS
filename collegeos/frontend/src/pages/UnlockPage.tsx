import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";
import logoPng from "@/assets/collegeos-logo.png";

export function UnlockPage() {
  const { authenticated, hasUser, initialized, setAuthState } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (initialized && !hasUser) {
    return <Navigate to="/setup" replace />;
  }

  if (initialized && authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<{ hasUser: boolean; authenticated: boolean }>(
        "/auth/unlock",
        { password }
      );

      setAuthState({
        hasUser: response.data.hasUser,
        authenticated: response.data.authenticated,
        initialized: true
      });
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <img src={logoPng} alt="CollegeOS Logo" className="h-16 w-16 object-contain mb-3" />
          <h1 className="text-3xl font-semibold text-center">Unlock CollegeOS</h1>
          <p className="mt-3 text-sm text-slate-300 text-center">
            Enter your master password to open your academic workspace.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Master Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none"
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Checking..." : "Unlock"}
          </button>
        </form>
      </section>
    </main>
  );
}
