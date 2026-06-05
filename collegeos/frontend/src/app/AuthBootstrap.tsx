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
        // Get current status
        const statusResponse = await apiClient.get<{ hasUser: boolean; authenticated: boolean }>(
          "/auth/status"
        );

        if (cancelled) return;

        // If no user exists, auto-setup
        if (!statusResponse.data.hasUser) {
          try {
            const setupResponse = await apiClient.post<{ hasUser: boolean; authenticated: boolean }>(
              "/auth/setup",
              {}
            );
            if (!cancelled) {
              setAuthState({
                hasUser: setupResponse.data.hasUser,
                authenticated: true,
                initialized: true
              });
            }
          } catch (setupError) {
            console.error("Auto-setup failed:", setupError);
            if (!cancelled) {
              setAuthState({
                hasUser: false,
                authenticated: false,
                initialized: true
              });
            }
          }
        } else {
          // User exists, authenticate
          if (!cancelled) {
            setAuthState({
              hasUser: statusResponse.data.hasUser,
              authenticated: true,
              initialized: true
            });
          }
        }
      } catch (error) {
        console.error("Bootstrap error:", error);
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
