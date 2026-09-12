import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { emergency as emApi } from "../api/endpoints";
import StatusBadge from "../components/StatusBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import { AlertTriangle, Plus, Check, ShieldAlert, AlertCircle } from "lucide-react";
import { parseValidationErrors } from "./Register";

export default function EmergencyPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    request_type: "supplies",
    description: "",
    urgency: "critical",
    people_affected: 2,
    address_text: "Hebbal, Mysuru",
  });

  const loadItems = () => {
    setLoading(true);
    emApi
      .list({})
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(parseValidationErrors(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await emApi.create(form);
      setShowForm(false);
      setForm({
        request_type: "supplies",
        description: "",
        urgency: "critical",
        people_affected: 2,
        address_text: "Hebbal, Mysuru",
      });
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleClaim = async (id) => {
    try {
      await emApi.claim(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleFulfill = async (id) => {
    try {
      await emApi.fulfill(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Emergency Aid & Disaster Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Emergency requests for water, emergency kits, evacuation assistance, and rescue coordination.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Close Form" : "Create SOS Request"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">New Emergency Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Aid Type *</label>
              <select
                value={form.request_type}
                onChange={(e) => setForm({ ...form, request_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="rescue">Rescue / Evacuation</option>
                <option value="medical">Urgent Medical</option>
                <option value="shelter">Emergency Shelter</option>
                <option value="supplies">Food & Water Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="critical">Critical (Immediate danger)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">People Affected</label>
              <input
                type="number"
                min={1}
                value={form.people_affected}
                onChange={(e) => setForm({ ...form, people_affected: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Details</label>
            <input
              type="text"
              value={form.address_text}
              onChange={(e) => setForm({ ...form, address_text: e.target.value })}
              placeholder="e.g., Near Hebbal Lake, Mysuru"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Situation Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what help is needed immediately..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Broadcast SOS
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading emergency dispatches...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No active emergency requests.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm capitalize">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    {item.request_type}
                  </div>
                  <UrgencyBadge urgency={item.urgency} />
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3">{item.description}</p>
                <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
                  <span>Affected: <strong className="text-slate-700">{item.people_affected}</strong></span>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.address_text || "Mysuru"}</span>
                <div className="flex gap-2">
                  {item.status === "open" && ["volunteer", "ngo", "admin"].includes(user?.role) && (
                    <button
                      onClick={() => handleClaim(item.id)}
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                    >
                      Respond to SOS
                    </button>
                  )}
                  {item.status === "in_progress" && (user?.id === item.assigned_to || user?.role === "admin") && (
                    <button
                      onClick={() => handleFulfill(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
