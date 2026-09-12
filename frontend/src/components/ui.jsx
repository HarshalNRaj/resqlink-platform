export function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 shadow-[0_4px_20px_rgba(26,20,16,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-soft/60 px-6 py-14 text-center">
      <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function FieldLabel({ children }) {
  return <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">{children}</label>;
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/40 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${props.className || ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/40 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${props.className || ""}`}
    >
      {children}
    </select>
  );
}
