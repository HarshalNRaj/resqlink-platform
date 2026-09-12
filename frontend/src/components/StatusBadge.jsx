const STYLES = {
  available: "bg-primary-50 text-primary-600 border-primary-100",
  open: "bg-primary-50 text-primary-600 border-primary-100",
  requested: "bg-amber-50 text-amber-600 border-amber-500/30",
  matched: "bg-amber-50 text-amber-600 border-amber-500/30",
  assigned: "bg-amber-50 text-amber-600 border-amber-500/30",
  in_progress: "bg-amber-50 text-amber-600 border-amber-500/30",
  completed: "bg-primary-500 text-paper border-primary-500",
  fulfilled: "bg-primary-500 text-paper border-primary-500",
  cancelled: "bg-ink-soft/10 text-ink-muted border-line",
  closed: "bg-ink-soft/10 text-ink-muted border-line",
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
  const cls = STYLES[status] || "bg-paper-soft text-ink-soft border-line";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide uppercase ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {LABELS[status] || status}
    </span>
  );
}
