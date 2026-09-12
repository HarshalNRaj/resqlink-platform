const STYLES = {
  low: "bg-primary-50 text-primary-700",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-urgent-50 text-urgent-600",
  critical: "bg-urgent-500 text-white",
};

export default function UrgencyBadge({ urgency }) {
  const cls = STYLES[urgency] || "bg-line text-ink-soft";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${cls}`}>
      {urgency}
    </span>
  );
}
