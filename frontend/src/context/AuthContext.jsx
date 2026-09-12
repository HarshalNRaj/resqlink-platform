import { createContext, useContext, useEffect, useState } from "react";
import { auth as authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("resqlink_user");
    return raw ? JSON.parse(raw) : null;
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
        localStorage.removeItem("resqlink_access");
        localStorage.removeItem("resqlink_refresh");
        localStorage.removeItem("resqlink_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem("resqlink_access", data.access);
    localStorage.setItem("resqlink_refresh", data.refresh);
    localStorage.setItem("resqlink_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("resqlink_access");
    localStorage.removeItem("resqlink_refresh");
    localStorage.removeItem("resqlink_user");
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await authApi.me();
    setUser(data);
    localStorage.setItem("resqlink_user", JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
