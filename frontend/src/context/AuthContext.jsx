import { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api";

export const AuthContext = createContext(null);
const TOKEN_KEY = "cove_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    async function boot() {
      if (!token) {
        if (alive) setBooting(false);
        return;
      }
      try {
        const res = await authApi.me();
        if (alive) setUser(res.data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (alive) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (alive) setBooting(false);
      }
    }
    boot();
    return () => {
      alive = false;
    };
  }, [token]);

  const value = useMemo(() => {
    async function login(credentials) {
      const res = await authApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }

    async function register(payload) {
      const res = await authApi.register(payload);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }

    function logout() {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }

    async function refreshProfile() {
      const res = await authApi.me();
      setUser(res.data.user);
      return res.data.user;
    }

    return {
      user,
      token,
      booting,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
    };
  }, [user, token, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
