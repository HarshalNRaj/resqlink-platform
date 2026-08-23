const STYLES = {
  available: "bg-primary-50 text-primary-700 border-primary-100",
  open: "bg-primary-50 text-primary-700 border-primary-100",
  requested: "bg-amber-50 text-amber-600 border-amber-500/30",
  matched: "bg-amber-50 text-amber-600 border-amber-500/30",
  assigned: "bg-amber-50 text-amber-600 border-amber-500/30",
  in_progress: "bg-amber-50 text-amber-600 border-amber-500/30",
  completed: "bg-primary-500 text-white border-primary-500",
  fulfilled: "bg-primary-500 text-white border-primary-500",
  cancelled: "bg-ink-soft/10 text-ink-soft border-ink-soft/20",
  closed: "bg-ink-soft/10 text-ink-soft border-ink-soft/20",
};

const LABELS = {
  available: "Available",
  open: "Open",
  requested: "Requested",
  matched: "Matched",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  closed: "Closed",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-line text-ink-soft border-line";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {LABELS[status] || status}
    </span>
  );
}
