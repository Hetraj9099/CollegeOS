import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";

export function SetupPage() {
  const { authenticated, hasUser, initialized, setAuthState } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (initialized && hasUser) {
    return <Navigate to="/unlock" replace />;
  }

  if (initialized && authenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{ hasUser: boolean; authenticated: boolean }>(
        "/auth/setup",
        { password }
      );

      setAuthState({
        hasUser: response.data.hasUser,
        authenticated: response.data.authenticated,
        initialized: true
      });
    } catch {
      setError("Setup could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold">Set up CollegeOS</h1>
        <p className="mt-3 text-sm text-slate-300">
          Create your single master password for this device-connected workspace.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="password">
              Master Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none"
              autoComplete="new-password"
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Password"}
          </button>
        </form>
      </section>
    </main>
  );
}
