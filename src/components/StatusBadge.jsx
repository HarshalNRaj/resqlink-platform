import React from "react";

export function StatusBadge({ status }) {
  const map = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    open: "bg-blue-50 text-blue-700 border-blue-200",
    requested: "bg-amber-50 text-amber-700 border-amber-200",
    assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    matched: "bg-sky-50 text-sky-700 border-sky-200",
    completed: "bg-slate-100 text-slate-700 border-slate-300",
    fulfilled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const label = status?.replace("_", " ") || "unknown";
  const styles = map[status] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border capitalize ${styles}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
