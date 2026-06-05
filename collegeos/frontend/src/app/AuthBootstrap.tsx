import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const { token, clearSession, setInitialized } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        if (!cancelled) {
          setInitialized(true);
        }
        return;
      }

      try {
        await apiClient.get("/auth/session");
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setInitialized(true);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token, clearSession, setInitialized]);

  return <>{children}</>;
}
