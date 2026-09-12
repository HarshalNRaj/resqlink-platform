import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, AlertCircle, Sparkles } from "lucide-react";
import { parseValidationErrors } from "./Register";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/app");
    } catch (err) {
      setError(parseValidationErrors(err) || "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const setDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            R
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to ResQLink
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            register for a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div
              id="login-error-alert"
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 whitespace-pre-line"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., asha_donor"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Demo Accounts (password: password123)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemo("admin", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-400">admin</div>
              </button>
              <button
                type="button"
                onClick={() => setDemo("meera", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Receiver</div>
                <div className="text-[10px] text-slate-400">meera</div>
              </button>
              <button
                type="button"
                onClick={() => setDemo("asha_donor", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Donor</div>
                <div className="text-[10px] text-slate-400">asha_donor</div>
              </button>
              <button
                type="button"
                onClick={() => setDemo("ravi_volunteer", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Volunteer</div>
                <div className="text-[10px] text-slate-400">ravi_volunteer</div>
              </button>
              <button
                type="button"
                onClick={() => setDemo("hope_ngo", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">NGO</div>
                <div className="text-[10px] text-slate-400">hope_ngo</div>
              </button>
              <button
                type="button"
                onClick={() => setDemo("citycare_bloodbank", "password123")}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">Blood Bank</div>
                <div className="text-[10px] text-slate-400">citycare_bloodbank</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
