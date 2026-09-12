import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Droplet,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function parseValidationErrors(error) {
  if (!error) return null;
  if (typeof error === "string") return error;

  const data = error.response?.data;
  if (!data) {
    return error.message || "Unable to connect to server. Please try again.";
  }

  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  // Django Rest Framework returns an object with field names mapped to arrays of error strings
  if (typeof data === "object") {
    const errorList = [];
    for (const [field, messages] of Object.entries(data)) {
      const fieldName =
        field === "non_field_errors" || field === "detail"
          ? ""
          : `${field.replace(/_/g, " ")}: `;
      if (Array.isArray(messages)) {
        errorList.push(`${fieldName}${messages.join(" ")}`);
      } else if (typeof messages === "string") {
        errorList.push(`${fieldName}${messages}`);
      } else if (typeof messages === "object" && messages !== null) {
        errorList.push(`${fieldName}${JSON.stringify(messages)}`);
      }
    }
    if (errorList.length > 0) {
      return errorList.join("\n");
    }
  }

  return "Validation error. Please verify your inputs.";
}

const PUBLIC_ROLES = [
  { value: "general", label: "Receiver", desc: "Request resources, food, or emergency aid" },
  { value: "donor", label: "Donor", desc: "Donate goods, rescue food, offer blood" },
  { value: "volunteer", label: "Volunteer", desc: "Deliver resources and help in crises" },
  { value: "ngo", label: "NGO / Community Org", desc: "Coordinate relief operations (requires verification)" },
  { value: "blood_bank", label: "Blood Bank", desc: "Manage inventory and blood supplies (requires verification)" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "general",
    organization_name: "",
    blood_group: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Note: Do NOT trim password! Passwords can contain spaces.
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password, // Preserve exact password without accidental trimming
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        organization_name: ["ngo", "blood_bank"].includes(form.role)
          ? form.organization_name.trim()
          : "",
        blood_group: form.role === "donor" ? form.blood_group : "",
      };

      const res = await register(payload);
      if (["ngo", "blood_bank"].includes(form.role)) {
        setSuccessMsg(
          "Registration submitted! Your organization account is pending administrator verification before you can access protected workflows. Redirecting to login..."
        );
      } else {
        setSuccessMsg("Account created successfully! Redirecting to login...");
      }
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const parsed = parseValidationErrors(err);
      setError(parsed);
    } finally {
      setSubmitting(false);
    }
  };

  const isOrg = ["ngo", "blood_bank"].includes(form.role);
  const isDonor = form.role === "donor";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            R
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create your ResQLink account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div
              id="register-error-alert"
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 whitespace-pre-line"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div
              id="register-success-alert"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                I am joining as:
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PUBLIC_ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      form.role === r.value
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">{r.label}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="register-username"
                    name="username"
                    type="text"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  id="register-first-name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  id="register-last-name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used for urgent coordination during pickups and emergencies.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must be at least 8 characters and not too common.
              </p>
            </div>

            {/* Conditional NGO / Blood Bank Organization Name */}
            {isOrg && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="register-organization-name"
                    name="organization_name"
                    type="text"
                    required
                    value={form.organization_name}
                    onChange={handleChange}
                    placeholder={
                      form.role === "blood_bank"
                        ? "e.g., CityCare Red Cross Blood Bank"
                        : "e.g., Hope Community Relief NGO"
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <p className="text-[11px] text-amber-700 mt-2 font-medium">
                  Notice: Organization accounts will be registered as pending verification until reviewed by an administrator.
                </p>
              </div>
            )}

            {/* Conditional Donor Blood Group */}
            {isDonor && (
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  Blood Group (Optional)
                </label>
                <select
                  id="register-blood-group"
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="">Select your blood group (optional)</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-rose-700/80 mt-1">
                  Allows recipients and blood banks to match critical requests with your blood type.
                </p>
              </div>
            )}

            <button
              id="register-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
            >
              {submitting ? "Creating account..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
