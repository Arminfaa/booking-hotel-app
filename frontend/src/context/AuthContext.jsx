import { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    async function boot() {
      try {
        const res = await authApi.me();
        if (alive) setUser(res.data.user);
      } catch {
        try {
          const refreshed = await authApi.refresh();
          if (alive) setUser(refreshed.data.user);
        } catch {
          if (alive) setUser(null);
        }
      } finally {
        if (alive) setBooting(false);
      }
    }
    boot();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => {
    async function login(credentials) {
      const res = await authApi.login(credentials);
      setUser(res.data.user);
      return res.data.user;
    }

    async function register(payload) {
      const res = await authApi.register(payload);
      setUser(res.data.user);
      return res.data.user;
    }

    async function logout() {
      try {
        await authApi.logout();
      } catch {
        // ignore network logout errors
      }
      setUser(null);
    }

    async function refreshProfile() {
      const res = await authApi.me();
      setUser(res.data.user);
      return res.data.user;
    }

    return {
      user,
      booting,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
    };
  }, [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
