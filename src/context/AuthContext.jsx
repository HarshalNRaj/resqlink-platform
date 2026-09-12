import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
import { auth as authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("resqlink_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("resqlink_access");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("resqlink_user", JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("resqlink_access");
        localStorage.removeItem("resqlink_refresh");
        localStorage.removeItem("resqlink_user");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password });
    localStorage.setItem("resqlink_access", data.access);
    localStorage.setItem("resqlink_refresh", data.refresh);
    localStorage.setItem("resqlink_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("resqlink_access");
    localStorage.removeItem("resqlink_refresh");
    localStorage.removeItem("resqlink_user");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authApi.me();
      setUser(data);
      localStorage.setItem("resqlink_user", JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
