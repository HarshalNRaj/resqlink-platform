import { motion } from "motion/react";

const VARIANTS = {
  primary: "bg-primary-500 text-paper hover:bg-primary-600 disabled:bg-primary-100 disabled:text-ink-soft/40 shadow-sm",
  urgent: "bg-urgent-500 text-paper hover:bg-urgent-600 disabled:opacity-50 shadow-sm",
  outline: "border border-line-dark bg-surface text-ink hover:bg-surface-soft hover:border-primary-500 disabled:opacity-50",
  ghost: "text-ink-soft hover:text-ink hover:bg-paper-soft/60 disabled:opacity-50",
};

export default function Button({ variant = "primary", className = "", children, disabled, ...props }) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
