import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { FieldLabel, Select, TextInput } from "../components/ui";

const ROLES = [
  { value: "general", label: "General user — browse & request" },
  { value: "donor", label: "Donor — give items, food, or blood" },
  { value: "volunteer", label: "Volunteer — handle pickup & delivery" },
  { value: "ngo", label: "NGO / community organization" },
  { value: "blood_bank", label: "Blood bank" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "", first_name: "",
    role: "general", organization_name: "", blood_group: "", phone: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const needsOrg = form.role === "ngo" || form.role === "blood_bank";

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { message } = await register(form);
      if (needsOrg) {
        setNotice(message);
        setLoading(false);
        return;
      }
      await login(form.username, form.password);
      navigate("/app");
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && typeof data === "object" ? Object.values(data)[0] : null;
      setError((Array.isArray(firstError) ? firstError[0] : firstError) || "Registration failed. Please check your details.");
      setLoading(false);
    }
  };

  if (notice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
          <h1 className="font-display text-xl font-bold text-ink">Account created</h1>
          <p className="mt-2 text-sm text-ink-soft">{notice}</p>
          <Link to="/login">
            <Button className="mt-5 w-full">Go to sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 font-display text-lg font-bold text-white">
            R
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Join ResQLink</h1>
          <p className="mt-1 text-sm text-ink-soft">One account, every way to help.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          {error && <div className="rounded-lg bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</div>}

          <div>
            <FieldLabel>I want to join as</FieldLabel>
            <Select value={form.role} onChange={handleChange("role")}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Username</FieldLabel>
              <TextInput value={form.username} onChange={handleChange("username")} required />
            </div>
            <div>
              <FieldLabel>First name</FieldLabel>
              <TextInput value={form.first_name} onChange={handleChange("first_name")} />
            </div>
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput type="email" value={form.email} onChange={handleChange("email")} required />
          </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput type="password" value={form.password} onChange={handleChange("password")} required />
          </div>

          {needsOrg && (
            <div>
              <FieldLabel>Organization name</FieldLabel>
              <TextInput value={form.organization_name} onChange={handleChange("organization_name")} required />
              <p className="mt-1 text-xs text-ink-soft">
                NGO and blood bank accounts need admin verification before they're marked verified.
              </p>
            </div>
          )}

          {form.role === "donor" && (
            <div>
              <FieldLabel>Blood group (optional)</FieldLabel>
              <Select value={form.blood_group} onChange={handleChange("blood_group")}>
                <option value="">Prefer not to say</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
