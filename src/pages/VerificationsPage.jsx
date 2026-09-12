import React, { useState, useEffect } from "react";
import { auth as authApi } from "../api/endpoints";
import { ShieldCheck, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { parseValidationErrors } from "./Register";

export default function VerificationsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPending = () => {
    setLoading(true);
    authApi
      .pendingVerifications()
      .then(({ data }) => setPending(Array.isArray(data) ? data : []))
      .catch((err) => setError(parseValidationErrors(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id, orgName) => {
    setError("");
    setSuccess("");
    try {
      await authApi.approveVerification(id);
      setSuccess(`Approved ${orgName || "organization"} successfully.`);
      loadPending();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          Organization Verifications (Admin)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review credentials and approve NGOs and Blood Banks before they can participate in protected operations.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading pending verifications...</div>
      ) : pending.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 mt-1">
            No NGO or blood bank accounts are currently waiting for admin review.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {pending.map((org) => (
            <div key={org.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{org.organization_name || org.username}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {org.role.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Username: <span className="font-medium text-slate-700">{org.username}</span> &bull; Email:{" "}
                    <span className="font-medium text-slate-700">{org.email}</span>
                  </div>
                  {org.phone && (
                    <div className="text-xs text-slate-500">Phone: {org.phone}</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleApprove(org.id, org.organization_name)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" /> Approve Organization
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
