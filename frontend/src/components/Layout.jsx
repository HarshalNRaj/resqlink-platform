import {
  BarChart3, Droplet, LayoutDashboard, LogOut, Package, ShieldCheck, Siren, User, UtensilsCrossed,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { canAccess } from "../roleAccess";

const NAV = [
  { to: "/app", section: "dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/app/resources", section: "resources", icon: Package, label: "Resources" },
  { to: "/app/food", section: "food", icon: UtensilsCrossed, label: "Food rescue" },
  { to: "/app/blood", section: "blood", icon: Droplet, label: "Blood requests" },
  { to: "/app/emergency", section: "emergency", icon: Siren, label: "Emergency support" },
  { to: "/app/impact", section: "impact", icon: BarChart3, label: "Impact" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 font-display text-sm font-bold text-white">
            R
          </div>
          <span className="font-display text-lg font-bold text-ink">ResQLink</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.filter(({ section }) => section === "dashboard" || canAccess(user?.role, section)).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-500 text-white" : "text-ink-soft hover:bg-primary-50 hover:text-primary-700"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/app/verifications"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-500 text-white" : "text-ink-soft hover:bg-primary-50 hover:text-primary-700"
                }`
              }
            >
              <ShieldCheck size={18} />
              Verifications
            </NavLink>
          )}
        </nav>
        <div className="border-t border-line px-3 py-3">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-primary-50 text-primary-700" : "text-ink-soft hover:bg-primary-50"
              }`
            }
          >
            <User size={18} />
            <span className="truncate">{user?.username}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-urgent-50 hover:text-urgent-600"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:px-8">
          <div className="md:hidden font-display text-lg font-bold text-primary-700">ResQLink</div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold capitalize text-primary-700 sm:inline-block">
              {user?.role?.replace("_", " ")}
            </span>
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
