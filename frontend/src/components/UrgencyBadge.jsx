const STYLES = {
  low: "bg-primary-50 text-primary-600 border border-primary-100",
  medium: "bg-amber-50 text-amber-600 border border-amber-500/20",
  high: "bg-urgent-50 text-urgent-500 border border-urgent-100",
  critical: "bg-urgent-500 text-paper border border-urgent-600 shadow-sm",
};

export default function UrgencyBadge({ urgency }) {
  const cls = STYLES[urgency] || "bg-paper-soft text-ink-soft border border-line";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${cls}`}>
      {urgency}
    </span>
  );
}
