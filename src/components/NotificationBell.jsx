import React, { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notifications as notifApi } from "../api/endpoints";

export function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifs = () => {
    notifApi
      .list()
      .then(({ data }) => setItems(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await notifApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const markItemRead = async (id) => {
    try {
      await notifApi.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" id="notification-bell-container">
      <button
        id="notification-bell-button"
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            id="unread-notifications-badge"
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet</p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markItemRead(n.id)}
                  className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                    !n.is_read ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <p className={`text-slate-800 ${!n.is_read ? "font-semibold" : ""}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
