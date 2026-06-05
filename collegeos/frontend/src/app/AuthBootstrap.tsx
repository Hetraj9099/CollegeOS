import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { useAuthStore } from "@/store/auth-store";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const { setAuthState } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await apiClient.get<{ hasUser: boolean; authenticated: boolean }>(
          "/auth/status"
        );

        if (!cancelled) {
          setAuthState({
            hasUser: response.data.hasUser,
            authenticated: response.data.authenticated,
            initialized: true
          });
        }
      } catch {
        if (!cancelled) {
          setAuthState({
            hasUser: true,
            authenticated: false,
            initialized: true
          });
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setAuthState]);

  return <>{children}</>;
}
