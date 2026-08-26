import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { notifications as notifApi } from "../api/endpoints";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    notifApi.list().then(({ data }) => setItems(data.results || data));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAll = async () => {
    await notifApi.markAllRead();
    load();
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) await notifApi.markRead(notification.id);
    setOpen(false);
    const message = notification.message.toLowerCase();
    const section = message.includes("blood") || message.includes("donat") ? "blood"
      : message.includes("food") || message.includes("rescued") ? "food"
        : message.includes("emergency") ? "emergency" : "resources";
    navigate(`/app/${section}`);
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-ink-soft hover:bg-primary-50 hover:text-primary-700"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-urgent-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAll} className="text-xs font-medium text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-soft">You're all caught up.</p>
            ) : (
              items.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  type="button"
                  className={`block w-full border-b border-line px-4 py-3 text-left text-sm last:border-0 hover:bg-primary-50 ${!n.is_read ? "bg-primary-50/50" : ""}`}
                >
                  <p className="text-ink">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-soft">{new Date(n.created_at).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
