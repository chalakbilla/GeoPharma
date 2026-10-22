import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

function loadUser() {
  try {
    const saved = read("geopharma_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null; // corrupted value — treat as logged out instead of crashing the app
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const persist = useCallback((token, nextUser) => {
    try {
      localStorage.setItem("geopharma_token", token);
      localStorage.setItem("geopharma_user", JSON.stringify(nextUser));
    } catch {
      /* private mode: the session just won't survive a refresh */
    }
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("geopharma_token");
      localStorage.removeItem("geopharma_user");
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  // Drop stale sessions (expired token) quietly on first load.
  useEffect(() => {
    if (!read("geopharma_token")) return;
    api.get("/auth/me").catch((err) => {
      if (err?.response?.status === 401) logout();
    });
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data.token, data.user);
    },
    [persist]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const { data } = await api.post("/auth/signup", { name, email, password });
      persist(data.token, data.user);
    },
    [persist]
  );

  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
