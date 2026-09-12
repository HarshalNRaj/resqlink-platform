import {
  BarChart3, Droplet, LayoutDashboard, LogOut, Package, ShieldCheck, Siren, User, UtensilsCrossed,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Resource Dashboard", end: true },
  { to: "/app/resources", icon: Package, label: "Resource Catalogue" },
  { to: "/app/food", icon: UtensilsCrossed, label: "Food Salvage" },
  { to: "/app/blood", icon: Droplet, label: "Blood Registry" },
  { to: "/app/emergency", icon: Siren, label: "Emergency Board" },
  { to: "/app/impact", icon: BarChart3, label: "Community Impact" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 font-serif text-base font-bold text-paper">
            r
          </div>
          <div>
            <span className="font-serif text-xl font-semibold tracking-tight text-ink lowercase block leading-none">
              resqlink
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-muted block mt-1">
              Mutual Aid Network
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-mono uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "bg-primary-500 text-paper shadow-sm"
                    : "text-ink-soft hover:bg-paper-soft/70 hover:text-ink"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/app/verifications"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-mono uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "bg-primary-500 text-paper shadow-sm"
                    : "text-ink-soft hover:bg-paper-soft/70 hover:text-ink"
                }`
              }
            >
              <ShieldCheck size={16} />
              Verifications
            </NavLink>
          )}
        </nav>
        <div className="border-t border-line px-3 py-3 bg-surface-soft/40">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-mono tracking-wide ${
                isActive ? "bg-paper-soft text-ink font-medium" : "text-ink-soft hover:bg-paper-soft/60"
              }`
            }
          >
            <User size={16} />
            <span className="truncate">{user?.username}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-mono tracking-wide text-ink-soft hover:bg-urgent-50 hover:text-urgent-500 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface/90 backdrop-blur-sm px-4 py-3 md:px-8">
          <div className="md:hidden font-serif text-xl font-bold text-ink lowercase">resqlink</div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-ink-muted uppercase tracking-widest">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" />
            <span>Mysuru Dispatch</span>
            <span>·</span>
            <span className="text-[#2C3A2C] font-semibold">Active Mesh</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-line bg-paper-soft px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft sm:inline-block">
              {user?.role?.replace("_", " ")}
            </span>
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
