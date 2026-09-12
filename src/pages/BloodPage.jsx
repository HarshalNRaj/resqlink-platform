import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { blood as bloodApi } from "../api/endpoints";
import StatusBadge from "../components/StatusBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import {
  Droplet,
  Plus,
  Building2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Edit3,
  Phone,
  MapPin,
  CheckCircle,
  Package,
} from "lucide-react";
import { parseValidationErrors } from "./Register";
import { isReceiver, isDonor, isBloodBank, isAdmin } from "../roleAccess";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Role detection
  const isBB = isBloodBank(user?.role);
  const isDon = isDonor(user?.role);
  const isRec = isReceiver(user?.role) || user?.role === "general";
  const isAdm = isAdmin(user?.role);
  const isVerifiedOrg = Boolean(user?.is_verified);

  // Blood Bank specific profile state
  const [myBank, setMyBank] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.organization_name || "",
    address_text: "",
    contact_phone: user?.phone || "",
    lat: 12.2958,
    lng: 76.6394,
  });

  // Filter state
  const [activeFilter, setActiveFilter] = useState("all");

  const [form, setForm] = useState({
    blood_group: "O+",
    units_needed: 1,
    urgency: "high",
    hospital_name: "Apollo BGS Hospitals, Mysuru",
    address_text: "Kuvempunagar, Mysuru",
    notes: "",
  });

  const loadData = () => {
    setLoading(true);
    const promises = [
      bloodApi.list({}).catch(() => ({ data: [] })),
      bloodApi.banks().catch(() => ({ data: [] })),
    ];

    if (isBB) {
      promises.push(bloodApi.myBank().catch(() => ({ data: null })));
    }

    Promise.all(promises)
      .then(([reqRes, bankRes, myBankRes]) => {
        setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        setBanks(Array.isArray(bankRes.data) ? bankRes.data : []);

        if (isBB && myBankRes?.data) {
          setMyBank(myBankRes.data);
          setProfileForm({
            name: myBankRes.data.name || user?.organization_name || "",
            address_text: myBankRes.data.address_text || "",
            contact_phone: myBankRes.data.contact_phone || user?.phone || "",
            lat: myBankRes.data.lat ?? 12.2958,
            lng: myBankRes.data.lng ?? 76.6394,
          });
        }
      })
      .catch((err) => setError(parseValidationErrors(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user?.id, user?.role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      await bloodApi.create(form);
      setShowForm(false);
      setSuccessMsg("Blood request submitted successfully.");
      loadData();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setProfileSaving(true);
    try {
      const res = await bloodApi.saveMyBank(profileForm);
      setMyBank(res.data);
      setIsEditingProfile(false);
      setSuccessMsg("Blood Bank facility profile updated successfully.");
      loadData();
    } catch (err) {
      setError(parseValidationErrors(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleOfferDonate = async (id) => {
    setError("");
    setSuccessMsg("");
    try {
      await bloodApi.offerToDonate(id);
      setSuccessMsg("Pledge recorded! You have matched this blood request.");
      loadData();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleMatchBank = async (id) => {
    setError("");
    setSuccessMsg("");
    if (!isVerifiedOrg) {
      setError("Your blood bank account is pending administrator verification. Protected operations are disabled.");
      return;
    }
    try {
      await bloodApi.matchBloodBank(id);
      setSuccessMsg("Blood units committed! The hospital and requester have been notified.");
      loadData();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  const handleFulfill = async (id) => {
    setError("");
    setSuccessMsg("");
    try {
      await bloodApi.fulfill(id);
      setSuccessMsg("Blood request marked as fulfilled successfully.");
      loadData();
    } catch (err) {
      setError(parseValidationErrors(err));
    }
  };

  // Compute blood demand summary by group
  const demandByGroup = BLOOD_GROUPS.map((bg) => {
    const openReqs = requests.filter((r) => r.blood_group === bg && r.status === "open");
    const units = openReqs.reduce((sum, r) => sum + (Number(r.units_needed) || 1), 0);
    return { group: bg, units, count: openReqs.length };
  });

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (activeFilter === "open") return r.status === "open";
    if (activeFilter === "mine") {
      if (isBB) {
        return (
          r.matched_blood_bank === myBank?.id ||
          (user?.organization_name && r.matched_blood_bank_name === user.organization_name)
        );
      }
      if (isDon) return r.matched_donor === user?.id;
      return r.requester === user?.id;
    }
    if (activeFilter === "fulfilled") return r.status === "fulfilled";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Droplet className="w-6 h-6 text-rose-600 fill-rose-600" />
            Blood Requests & Emergency Supply
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rapid coordination for hospital blood emergencies and certified blood bank supplies.
          </p>
        </div>

        {/* Receiver-Only or Admin Request Blood Action */}
        {(isRec || isAdm) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> {showForm ? "Close Form" : "Request Blood"}
          </button>
        )}
      </div>

      {/* Notifications / Feedback */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* BLOOD BANK SPECIFIC: Verification Status Banners */}
      {isBB && (
        <>
          {!isVerifiedOrg ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-3 shadow-sm">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 text-sm">Facility Verification Pending</h4>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Your blood bank facility account is currently under administrative review. You can review regional hospital demand and manage your facility profile. Protected operations (such as committing units or fulfilling requests) will unlock once verified by an administrator.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-3 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Certified Blood Bank Partner</h4>
                <p className="text-emerald-800 mt-0.5">
                  Your facility is verified. You have full authority to supply units for hospital emergencies and fulfill commitments.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* BLOOD BANK SPECIFIC: Facility Profile Management */}
      {isBB && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Blood Bank Facility Profile</h3>
                <p className="text-[11px] text-slate-500">Official registry details accessible to coordinating hospitals</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditingProfile ? "Cancel" : myBank ? "Edit Profile" : "Set Up Profile"}
            </button>
          </div>

          {isEditingProfile || !myBank ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
              {!myBank && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs">
                  <strong>Initial Setup Required:</strong> Please complete your facility profile information below to register your operating address and emergency contact phone.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. Mysuru Central Blood Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.contact_phone}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. +91 821 244 5566"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Facility Address *</label>
                <input
                  type="text"
                  required
                  value={profileForm.address_text}
                  onChange={(e) => setProfileForm({ ...profileForm, address_text: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Sayyaji Rao Road, Mandi Mohalla, Mysuru, Karnataka"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {myBank && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
                >
                  {profileSaving ? "Saving..." : myBank ? "Update Facility Details" : "Save & Register Profile"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Facility Name</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{myBank.name || user?.organization_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Operating Address</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{myBank.address_text || "Mysuru, Karnataka"}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Direct Hotline</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{myBank.contact_phone || user?.phone || "Not recorded"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOOD DEMAND REQUIREMENTS BY GROUP */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-rose-600" />
            Regional Blood Supply Demand
          </h3>
          <span className="text-[11px] text-slate-400">Open hospital requirements</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {demandByGroup.map((item) => (
            <div
              key={item.group}
              className={`p-2.5 rounded-xl border text-center transition ${
                item.units > 0
                  ? "bg-rose-50/70 border-rose-200 text-rose-950"
                  : "bg-slate-50/50 border-slate-100 text-slate-400"
              }`}
            >
              <div className="text-xs font-black">{item.group}</div>
              <div className={`text-base font-extrabold mt-0.5 ${item.units > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {item.units}
              </div>
              <div className="text-[10px] text-slate-400">units</div>
            </div>
          ))}
        </div>
      </div>

      {/* Receiver Form for New Request */}
      {showForm && (isRec || isAdm) && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">New Emergency Blood Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Units Needed *</label>
              <input
                type="number"
                min={1}
                required
                value={form.units_needed}
                onChange={(e) => setForm({ ...form, units_needed: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="critical">Critical (Immediate)</option>
                <option value="high">High (Next 4 hours)</option>
                <option value="medium">Medium (Within 24h)</option>
                <option value="low">Scheduled Surgery</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name *</label>
              <input
                type="text"
                required
                value={form.hospital_name}
                onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
              <input
                type="text"
                value={form.address_text}
                onChange={(e) => setForm({ ...form, address_text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm"
            >
              Submit Blood Emergency
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveFilter("open")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeFilter === "open" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Needing Supply ({requests.filter((r) => r.status === "open").length})
        </button>
        <button
          onClick={() => setActiveFilter("mine")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeFilter === "mine" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {isBB ? "Our Bank Commitments" : isDon ? "My Blood Pledges" : "My Requests"}
        </button>
        <button
          onClick={() => setActiveFilter("fulfilled")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeFilter === "fulfilled" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Fulfilled ({requests.filter((r) => r.status === "fulfilled").length})
        </button>
      </div>

      {/* Blood Requests Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading blood coordination requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
          No blood requests found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => {
            const isMatchedToMyBank =
              isBB &&
              (req.matched_blood_bank === myBank?.id ||
                (user?.organization_name && req.matched_blood_bank_name === user.organization_name));
            const isMyRequest = user?.id === req.requester;
            const isMyDonorPledge = isDon && req.matched_donor === user?.id;

            return (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 font-black text-base flex items-center justify-center border border-rose-100">
                        {req.blood_group}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{req.hospital_name}</h3>
                        <div className="text-[11px] text-slate-500">{req.units_needed} unit(s) needed</div>
                      </div>
                    </div>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>

                  <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
                    <span>Status:</span>
                    <StatusBadge status={req.status} />
                  </div>

                  {req.matched_donor_username && (
                    <div className="mt-2 text-xs bg-indigo-50 text-indigo-700 p-2 rounded-lg font-medium">
                      Matched Donor: {req.matched_donor_username}
                    </div>
                  )}
                  {req.matched_blood_bank_name && (
                    <div className="mt-2 text-xs bg-sky-50 text-sky-700 p-2 rounded-lg font-medium flex items-center justify-between">
                      <span>Supplying Bank: {req.matched_blood_bank_name}</span>
                      {isMatchedToMyBank && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">Our Bank</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{req.address_text || "Mysuru"}</span>
                  <div className="flex items-center gap-2">
                    {/* Donor Action: Offer to Donate */}
                    {req.status === "open" && isDon && (
                      <button
                        onClick={() => handleOfferDonate(req.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
                      >
                        Offer to Donate
                      </button>
                    )}

                    {/* Blood Bank Action: Supply Units */}
                    {req.status === "open" && isBB && (
                      <button
                        onClick={() => handleMatchBank(req.id)}
                        disabled={!isVerifiedOrg}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isVerifiedOrg
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                        title={!isVerifiedOrg ? "Verification required to commit units" : "Supply blood units"}
                      >
                        {isVerifiedOrg ? "Supply Units" : "Supply (Pending)"}
                      </button>
                    )}

                    {/* Fulfill Action: Only Matched Blood Bank, Requester, Matched Donor, or Admin */}
                    {req.status === "matched" &&
                      (isMyRequest || isAdm || isMyDonorPledge || (isBB && isMatchedToMyBank)) && (
                        <button
                          onClick={() => handleFulfill(req.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
