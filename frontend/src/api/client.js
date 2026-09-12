import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

const setAuthorization = (config, token) => {
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
};

api.interceptors.request.use((config) => {
  setAuthorization(config, localStorage.getItem("resqlink_access"));
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isLoginRequest = original?.url?.endsWith("/auth/login/");

    if (error.response?.status !== 401 || !original || original._retry || isLoginRequest) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("resqlink_refresh");
    if (!refresh) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject, original });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${API_BASE}/auth/login/refresh/`,
        { refresh },
        { timeout: 10000 },
      );
      localStorage.setItem("resqlink_access", data.access);
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
      queue.forEach(({ resolve, original: queuedRequest }) => {
        setAuthorization(queuedRequest, data.access);
        resolve(api(queuedRequest));
      });
      queue = [];
      setAuthorization(original, data.access);
      return api(original);
    } catch (refreshErr) {
      queue.forEach(({ reject }) => reject(refreshErr));
      queue = [];
      localStorage.removeItem("resqlink_access");
      localStorage.removeItem("resqlink_refresh");
      localStorage.removeItem("resqlink_user");
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
