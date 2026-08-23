import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { FieldLabel, TextInput } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't sign in. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 font-display text-lg font-bold text-white">
            R
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to your ResQLink account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          {error && (
            <div className="rounded-lg bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</div>
          )}
          <div>
            <FieldLabel>Username</FieldLabel>
            <TextInput
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          New to ResQLink?{" "}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink-soft/70">
          Demo: asha_donor / ravi_volunteer / hope_ngo / citycare_bloodbank / meera — password123
        </p>
      </div>
    </div>
  );
}
