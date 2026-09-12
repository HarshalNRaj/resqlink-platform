import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { resources as resApi } from "../api/endpoints";
import StatusBadge from "../components/StatusBadge";
import { Plus, Check, Handshake, AlertCircle } from "lucide-react";
import { parseValidationErrors } from "./Register";

export default function ResourcesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filterMine, setFilterMine] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "furniture",
    condition: "good",
    description: "",
    quantity: 1,
    address_text: "Vijayanagar, Mysuru",
  });

  const loadItems = () => {
    setLoading(true);
    const params = filterMine !== "all" ? { mine: filterMine } : {};
    resApi
      .list(params)
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(parseValidationErrors(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, [filterMine]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await resApi.create(form);
      setShowForm(false);
      setForm({
        title: "",
        category: "furniture",
        condition: "good",
        description: "",
        quantity: 1,
        address_text: "Vijayanagar, Mysuru",
      });
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleRequest = async (id) => {
    try {
      await resApi.requestItem(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleAssign = async (id) => {
    try {
      await resApi.assign(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleComplete = async (id) => {
    try {
      await resApi.complete(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Donation & Reuse</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Share surplus items, books, clothing, and equipment with neighbors.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Close Form" : "Offer Resource"}
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
          <h3 className="text-sm font-bold text-slate-900">New Resource Listing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Study desk"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="furniture">Furniture</option>
                <option value="clothes">Clothes</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="medical_supplies">Medical Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
          >
            Publish Listing
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["all", "owned", "requested", "volunteering"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterMine(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filterMine === f ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {f === "owned" ? "My Listings" : f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading resources...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No items found matching filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Category: <span className="capitalize text-slate-600 font-medium">{item.category}</span> &bull; Condition:{" "}
                  <span className="capitalize text-slate-600 font-medium">{item.condition}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.description || "No description provided."}</p>
                <div className="text-[11px] text-slate-400 mt-3">
                  Donor: <span className="text-slate-700 font-semibold">{item.owner_username}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.address_text || "Mysuru"}</span>
                <div className="flex gap-2">
                  {item.status === "available" && item.owner !== user?.id && (
                    <button
                      onClick={() => handleRequest(item.id)}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold"
                    >
                      Request Item
                    </button>
                  )}
                  {item.status === "requested" && ["volunteer", "admin"].includes(user?.role) && !item.volunteer && (
                    <button
                      onClick={() => handleAssign(item.id)}
                      className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-xs font-semibold"
                    >
                      Claim Pickup
                    </button>
                  )}
                  {item.status === "assigned" && (user?.id === item.volunteer || user?.id === item.owner) && (
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Delivered
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
