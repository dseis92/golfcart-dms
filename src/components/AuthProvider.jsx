"use client";
import { createContext, useContext, useMemo, useState } from "react";

/**
 * Minimal auth context so pages can call useAuth() safely.
 * If you already have a full Firebase auth provider elsewhere,
 * this file is still compatible — just replace its internals later.
 */
const Ctx = createContext({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(Ctx);
}

export default function AuthProvider({ children }) {
  // Simple placeholder state; replace with Firebase onAuthStateChanged later if desired.
  const [user] = useState(null);
  const [loading] = useState(false);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async () => {},
      logout: async () => {},
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
