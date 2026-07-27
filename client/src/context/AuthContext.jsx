import React, { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("geopharma_user");
    return saved ? JSON.parse(saved) : null;
  });

  const persist = (token, user) => {
    localStorage.setItem("geopharma_token", token);
    localStorage.setItem("geopharma_user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("geopharma_token");
    localStorage.removeItem("geopharma_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
