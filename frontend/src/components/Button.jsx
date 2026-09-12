const VARIANTS = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-100",
  urgent: "bg-urgent-500 text-white hover:bg-urgent-600 disabled:opacity-50",
  outline: "border border-line bg-surface text-ink hover:border-primary-500 hover:text-primary-700 disabled:opacity-50",
  ghost: "text-primary-700 hover:bg-primary-50 disabled:opacity-50",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
