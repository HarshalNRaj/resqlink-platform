import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { food as foodApi } from "../api/endpoints";
import StatusBadge from "../components/StatusBadge";
import { Plus, Check, Clock, UtensilsCrossed, AlertCircle } from "lucide-react";
import { parseValidationErrors } from "./Register";

export default function FoodPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    quantity_servings: 10,
    address_text: "Kuvempunagar, Mysuru",
  });

  const loadItems = () => {
    setLoading(true);
    foodApi
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
      await foodApi.create(form);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        quantity_servings: 10,
        address_text: "Kuvempunagar, Mysuru",
      });
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleRequest = async (id) => {
    try {
      await foodApi.requestItem(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleAssign = async (id) => {
    try {
      await foodApi.assign(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleComplete = async (id) => {
    try {
      await foodApi.complete(id);
      loadItems();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Food Rescue & Distribution</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Prevent surplus food wastage by connecting catered events, hotels, and donors with shelters.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Close Form" : "List Surplus Meals"}
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
          <h3 className="text-sm font-bold text-slate-900">New Food Listing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 20 packs vegetable biryani"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Servings Count *</label>
              <input
                type="number"
                min={1}
                required
                value={form.quantity_servings}
                onChange={(e) => setForm({ ...form, quantity_servings: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Address</label>
            <input
              type="text"
              value={form.address_text}
              onChange={(e) => setForm({ ...form, address_text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Diet info</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Freshly prepared, vegetarian, packed in foil boxes."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Publish Food Rescue
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading food listings...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No food listings available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold mt-1">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{item.quantity_servings} servings</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.description || "Fresh surplus meal."}</p>
                <div className="text-[11px] text-slate-400 mt-3">
                  Provider: <span className="text-slate-700 font-semibold">{item.provider_username}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.address_text || "Mysuru"}</span>
                <div className="flex gap-2">
                  {item.status === "available" && item.provider !== user?.id && (
                    <button
                      onClick={() => handleRequest(item.id)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-xs font-semibold"
                    >
                      Request Food
                    </button>
                  )}
                  {item.status === "requested" && ["volunteer", "admin"].includes(user?.role) && !item.volunteer && (
                    <button
                      onClick={() => handleAssign(item.id)}
                      className="px-2.5 py-1 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-xs font-semibold"
                    >
                      Deliver
                    </button>
                  )}
                  {item.status === "assigned" && (user?.id === item.volunteer || user?.id === item.provider) && (
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Delivered
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
