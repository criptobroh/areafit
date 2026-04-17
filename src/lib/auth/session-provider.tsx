"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BackofficeSession } from "./types";

interface SessionContextValue {
  user: BackofficeSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  impersonating: boolean;
  originalEmail: string | null;
  /** Returns the real operator email — uses originalEmail when impersonating, otherwise session email. Use for activity logs and audit trails. */
  realEmail: string | null;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  impersonating: false,
  originalEmail: null,
  realEmail: null,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackofficeSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        refresh: fetchSession,
        impersonating: user?.impersonating ?? false,
        originalEmail: user?.originalEmail ?? null,
        realEmail: user?.impersonating && user?.originalEmail
          ? user.originalEmail
          : user?.email ?? null,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
