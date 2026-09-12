import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  Share2,
  UtensilsCrossed,
  Droplet,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { canAccess, ROLE_LABELS } from "../roleAccess";
import NotificationBell from "./NotificationBell";

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/app", section: "dashboard", icon: LifeBuoy },
    { label: "Resources", path: "/app/resources", section: "resources", icon: Share2 },
    { label: "Food Rescue", path: "/app/food", section: "food", icon: UtensilsCrossed },
    { label: "Blood", path: "/app/blood", section: "blood", icon: Droplet },
    { label: "Emergency", path: "/app/emergency", section: "emergency", icon: AlertTriangle },
    { label: "Impact", path: "/app/impact", section: "impact", icon: BarChart3 },
    { label: "Verifications", path: "/app/verifications", section: "verifications", icon: ShieldCheck },
  ].filter((item) => !user || canAccess(user.role, item.section));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Brand + Desktop Links */}
            <div className="flex items-center gap-8">
              <Link to="/app" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  R
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                    ResQLink
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Community Coordination
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/app"
                      ? location.pathname === "/app"
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Notifications & User profile */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <Link
                    to="/app/profile"
                    className="flex items-center gap-2 text-left hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs border border-indigo-200">
                      {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.first_name || user.username}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <span>{ROLE_LABELS[user.role] || user.role}</span>
                        {!user.is_verified && ["ngo", "blood_bank"].includes(user.role) && (
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded font-medium">
                            Pending
                          </span>
                        )}
                        {user.is_verified && ["ngo", "blood_bank"].includes(user.role) && (
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    type="button"
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/app"
                  ? location.pathname === "/app"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        ResQLink &bull; Community Resource & Emergency Support
      </footer>
    </div>
  );
}

export default Layout;
