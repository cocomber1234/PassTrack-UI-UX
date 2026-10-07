"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getLocalSessionUser, type LocalUser } from "@/lib/local-data";
import { LoadingState, Notice } from "@/components/ui";

type AuthContextValue = LocalUser;

const AuthContext = createContext<AuthContextValue | null>(null);

export function usePortalAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("usePortalAuth must be used inside PortalShell");
  return value;
}

export function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const sessionUser = getLocalSessionUser();
        if (!sessionUser) {
          router.replace("/login");
          return;
        }
        setUser(sessionUser);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Unable to read your local session.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [router]);

  const context = useMemo(() => user, [user]);

  if (loading) return <LoadingState />;
  if (authError) return <div className="mx-auto max-w-2xl px-6 py-16"><Notice>{authError}</Notice></div>;
  if (!context) return <LoadingState label="Taking you to sign in…" />;

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}
