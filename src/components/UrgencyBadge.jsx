import React from "react";

export function UrgencyBadge({ urgency }) {
  const map = {
    critical: "bg-red-50 text-red-700 border-red-200 font-bold animate-pulse",
    high: "bg-orange-50 text-orange-700 border-orange-200 font-semibold",
    medium: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
  };

  const styles = map[urgency] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      id={`urgency-badge-${urgency}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs uppercase tracking-wider border capitalize ${styles}`}
    >
      {urgency || "normal"}
    </span>
  );
}

export default UrgencyBadge;
