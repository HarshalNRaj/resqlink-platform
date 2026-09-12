import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Share2,
  UtensilsCrossed,
  Droplet,
  AlertTriangle,
  PlusCircle,
  Building2,
  ShieldCheck,
  CheckCircle,
  Truck,
  Heart,
  FileText,
  Hospital,
  Clock,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { resources, food, blood, emergency, auth as authApi } from "../api/endpoints";
import {
  isReceiver,
  isDonor,
  isVolunteer,
  isNGO,
  isBloodBank,
  isAdmin,
  ROLE_LABELS,
} from "../roleAccess";
import StatusBadge from "../components/StatusBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import MapView from "../components/MapView";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const userRole = user?.role || "general";

  const isRec = isReceiver(userRole);
  const isDon = isDonor(userRole);
  const isVol = isVolunteer(userRole);
  const isOrg = isNGO(userRole);
  const isBB = isBloodBank(userRole);
  const isAdm = isAdmin(userRole);

  const [allResources, setAllResources] = useState([]);
  const [allFood, setAllFood] = useState([]);
  const [allBlood, setAllBlood] = useState([]);
  const [allEmergency, setAllEmergency] = useState([]);
  const [bloodBanksList, setBloodBanksList] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    if (typeof refreshUser === "function") {
      refreshUser();
    }

    const fetches = [
      resources.list({}),
      food.list({}),
      blood.list({}),
      emergency.list({}),
    ];

    if (isBB) {
      fetches.push(blood.banks());
    } else if (isAdm) {
      fetches.push(authApi.pendingVerifications());
    }

    Promise.all(fetches)
      .then(([resRes, foodRes, bloodRes, emRes, extraRes]) => {
        if (!isMounted) return;

        const resData = Array.isArray(resRes?.data) ? resRes.data : [];
        const foodData = Array.isArray(foodRes?.data) ? foodRes.data : [];
        const bloodData = Array.isArray(bloodRes?.data) ? bloodRes.data : [];
        const emData = Array.isArray(emRes?.data) ? emRes.data : [];

        setAllResources(resData);
        setAllFood(foodData);
        setAllBlood(bloodData);
        setAllEmergency(emData);

        if (isBB && extraRes) {
          setBloodBanksList(Array.isArray(extraRes?.data) ? extraRes.data : []);
        } else if (isAdm && extraRes) {
          setPendingVerifications(Array.isArray(extraRes?.data) ? extraRes.data : []);
        }
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load dashboard data. Please check your connection and try again.";
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isBB, isAdm, refreshKey]);

  const isPendingOrg = user && !user.is_verified && (isOrg || isBB);
  const isVerifiedOrg = user && user.is_verified && (isOrg || isBB);

  // Derived user-specific data
  const myResourcesRequested = allResources.filter((r) => r.requester === user?.id);
  const myFoodRequested = allFood.filter((f) => f.requester === user?.id);
  const myBloodRequested = allBlood.filter((b) => b.requester === user?.id);
  const myEmergenciesRequested = allEmergency.filter((e) => e.requester === user?.id);

  const myGoodsDonated = allResources.filter((r) => r.owner === user?.id);
  const myFoodDonated = allFood.filter((f) => f.provider === user?.id);
  const myBloodOffers = allBlood.filter((b) => b.matched_donor === user?.id);

  const myVolunteerResourceAssignments = allResources.filter((r) => r.volunteer === user?.id);
  const myVolunteerFoodAssignments = allFood.filter((f) => f.volunteer === user?.id);
  const myVolunteerEmergencyAssignments = allEmergency.filter((e) => e.assigned_to === user?.id);

  const activeVolunteerAssignments = [
    ...myVolunteerFoodAssignments
      .filter((f) => f.status === "assigned")
      .map((f) => ({ ...f, taskType: "Food Delivery" })),
    ...myVolunteerResourceAssignments
      .filter((r) => r.status === "assigned")
      .map((r) => ({ ...r, taskType: "Resource Transport" })),
    ...myVolunteerEmergencyAssignments
      .filter((e) => e.status === "in_progress")
      .map((e) => ({ ...e, taskType: "Emergency Aid" })),
  ];

  const completedVolunteerAssignments = [
    ...myVolunteerFoodAssignments.filter((f) => f.status === "completed"),
    ...myVolunteerResourceAssignments.filter((r) => r.status === "completed"),
    ...myVolunteerEmergencyAssignments.filter((e) => e.status === "fulfilled" || e.status === "closed"),
  ];

  const pendingDeliveries = [
    ...allFood.filter((f) => f.status === "requested").map((f) => ({ ...f, taskType: "Food Rescue", route: "/app/food" })),
    ...allResources.filter((r) => r.status === "requested").map((r) => ({ ...r, taskType: "Goods Handoff", route: "/app/resources" })),
  ];

  // Blood bank specific
  const myBloodBank = bloodBanksList.find(
    (b) => b.user === user?.id || b.name === user?.organization_name
  );
  const bloodRequestsForBank = allBlood.filter((b) => b.status === "open" || b.matched_blood_bank === myBloodBank?.id);
  const bankMatchedCount = allBlood.filter(
    (b) => b.matched_blood_bank === myBloodBank?.id || b.matched_blood_bank_name === user?.organization_name
  ).length;

  if (loading) {
    return (
      <div id="dashboard-loading" className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-medium text-slate-800">Loading dashboard...</p>
        <p className="text-sm text-slate-500 mt-1">Retrieving latest community activities and requests.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="dashboard-error" className="bg-white border border-rose-200 rounded-2xl p-8 max-w-lg mx-auto my-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Dashboard</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error}
        </p>
        <button
          id="dashboard-retry-btn"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
              {ROLE_LABELS[userRole] || userRole.replace("_", " ")}
            </span>
            {isVerifiedOrg && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            )}
            {isPendingOrg && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isRec && "Request resources, surplus food, blood, or emergency assistance across Mysuru."}
            {isDon && "Coordinate your shared resources, surplus food donations, and blood pledges."}
            {isVol && "Review your active relief missions, pick up deliveries, and support community emergencies."}
            {isOrg && "Manage community relief operations, emergency dispatches, and essential supplies."}
            {isBB && "Monitor regional hospital blood requests, coordinate inventory, and supply units."}
            {isAdm && "ResQLink administrative dashboard & community coordination control center."}
          </p>
        </div>

        {/* Role-Specific Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* RECEIVER: Browsing & Requesting only. No donor creation actions. */}
          {isRec && (
            <>
              <Link
                to="/app/emergency"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" /> Request Emergency Aid
              </Link>
              <Link
                to="/app/resources"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <Share2 className="w-4 h-4" /> Browse Resources
              </Link>
              <Link
                to="/app/food"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <UtensilsCrossed className="w-4 h-4" /> Request Food
              </Link>
              <Link
                to="/app/blood"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition shadow-sm"
              >
                <Droplet className="w-4 h-4 text-rose-400" /> Request Blood
              </Link>
            </>
          )}

          {/* DONOR: Donation & Listing actions. No receiver-only actions. */}
          {isDon && (
            <>
              <Link
                to="/app/resources"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Share Resource
              </Link>
              <Link
                to="/app/food"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <UtensilsCrossed className="w-4 h-4" /> Donate Food
              </Link>
              <Link
                to="/app/blood"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
              >
                <Droplet className="w-4 h-4" /> Offer Blood
              </Link>
            </>
          )}

          {/* VOLUNTEER: Deliveries and response assignments */}
          {isVol && (
            <>
              <Link
                to="/app/food"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <Truck className="w-4 h-4" /> Food Deliveries
              </Link>
              <Link
                to="/app/resources"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <Share2 className="w-4 h-4" /> Goods Deliveries
              </Link>
              <Link
                to="/app/emergency"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" /> Crisis Response
              </Link>
            </>
          )}

          {/* NGO: Community relief operations if verified; restricted if unverified */}
          {isOrg && (
            <>
              {isVerifiedOrg ? (
                <>
                  <Link
                    to="/app/emergency"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4" /> Coordinate Emergency
                  </Link>
                  <Link
                    to="/app/resources"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Supply Goods
                  </Link>
                  <Link
                    to="/app/food"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <UtensilsCrossed className="w-4 h-4" /> Distribute Food
                  </Link>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" /> Operations locked pending verification
                </span>
              )}
            </>
          )}

          {/* BLOOD BANK: Blood operations specifically */}
          {isBB && (
            <>
              <Link
                to="/app/blood"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-sm"
              >
                <Droplet className="w-4 h-4" /> Blood Requests
              </Link>
              {isVerifiedOrg && (
                <Link
                  to="/app/blood"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition shadow-sm"
                >
                  <Hospital className="w-4 h-4 text-indigo-400" /> Supply Units
                </Link>
              )}
            </>
          )}

          {/* ADMIN: Verifications and system oversight */}
          {isAdm && (
            <>
              <Link
                to="/app/verifications"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Review Verifications
                {pendingVerifications.length > 0 && (
                  <span className="ml-1 bg-white text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                    {pendingVerifications.length}
                  </span>
                )}
              </Link>
              <Link
                to="/app/emergency"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" /> Emergencies
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Organization Verification Banners */}
      {isPendingOrg && (
        <div
          id="org-pending-verification-banner"
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-sm"
        >
          <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-950">
              Administrator Verification Pending: {user?.organization_name || user?.username}
            </div>
            <p className="text-amber-800 leading-relaxed">
              Your organization account is currently under administrative review. While unverified, you can monitor public needs and browse available community listings. Protected operations (such as listing supplies, claiming dispatch assignments, or providing blood units) remain disabled until verification is approved.
            </p>
          </div>
        </div>
      )}

      {isVerifiedOrg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-950">Verified Organization Partner: </span>
            <span>{user?.organization_name || user?.username}</span> has completed verification. All coordination and distribution tools are fully operational.
          </div>
        </div>
      )}

      {/* Role-Specific Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isRec && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Active Requests</span>
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {myResourcesRequested.length + myFoodRequested.length + myBloodRequested.length + myEmergenciesRequested.length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">Track your open requests</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Available Goods</span>
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allResources.filter((r) => r.status === "available").length}
              </div>
              <Link to="/app/resources" className="text-[11px] text-indigo-600 hover:underline mt-1 inline-block">
                Browse goods &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Surplus Food</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allFood.filter((f) => f.status === "available").length}
              </div>
              <Link to="/app/food" className="text-[11px] text-emerald-600 hover:underline mt-1 inline-block">
                Claim meals &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Emergency Aid</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allEmergency.filter((e) => e.status === "open").length}
              </div>
              <Link to="/app/emergency" className="text-[11px] text-rose-600 hover:underline mt-1 inline-block">
                Request crisis help &rarr;
              </Link>
            </div>
          </>
        )}

        {isDon && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Donated Goods</span>
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{myGoodsDonated.length}</div>
              <Link to="/app/resources" className="text-[11px] text-indigo-600 hover:underline mt-1 inline-block">
                Manage goods &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Food Donations</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{myFoodDonated.length}</div>
              <Link to="/app/food" className="text-[11px] text-emerald-600 hover:underline mt-1 inline-block">
                View listings &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Blood Pledges</span>
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{myBloodOffers.length}</div>
              <Link to="/app/blood" className="text-[11px] text-rose-600 hover:underline mt-1 inline-block">
                Blood requests &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Urgent Needs</span>
                <Droplet className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allBlood.filter((b) => b.status === "open").length}
              </div>
              <Link to="/app/blood" className="text-[11px] text-amber-600 hover:underline mt-1 inline-block">
                Help someone today &rarr;
              </Link>
            </div>
          </>
        )}

        {isVol && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">My Active Missions</span>
                <Truck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{activeVolunteerAssignments.length}</div>
              <span className="text-[11px] text-indigo-600 font-medium">In progress tasks</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Completed Work</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{completedVolunteerAssignments.length}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Deliveries fulfilled</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Open Deliveries</span>
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{pendingDeliveries.length}</div>
              <span className="text-[11px] text-slate-500">Waiting for volunteer</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Crisis Calls</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allEmergency.filter((e) => e.status === "open").length}
              </div>
              <Link to="/app/emergency" className="text-[11px] text-rose-600 hover:underline mt-1 inline-block">
                View emergencies &rarr;
              </Link>
            </div>
          </>
        )}

        {isOrg && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Org Status</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">
                {isVerifiedOrg ? "Verified" : "Pending Review"}
              </div>
              <span className="text-[11px] text-slate-500">{user?.organization_name || "Community Org"}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Goods Inventory</span>
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allResources.filter((r) => r.status === "available").length}
              </div>
              <Link to="/app/resources" className="text-[11px] text-indigo-600 hover:underline mt-1 inline-block">
                Review goods &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Surplus Food</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allFood.filter((f) => f.status === "available").length}
              </div>
              <Link to="/app/food" className="text-[11px] text-emerald-600 hover:underline mt-1 inline-block">
                Rescue food &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Emergencies</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allEmergency.filter((e) => e.status === "open").length}
              </div>
              <Link to="/app/emergency" className="text-[11px] text-amber-600 hover:underline mt-1 inline-block">
                Respond to crisis &rarr;
              </Link>
            </div>
          </>
        )}

        {isBB && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Bank Verification</span>
                <ShieldCheck className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">
                {isVerifiedOrg ? "Verified Partner" : "Pending Review"}
              </div>
              <span className="text-[11px] text-slate-500">{user?.organization_name || "Regional Blood Bank"}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Open Blood Requests</span>
                <Droplet className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allBlood.filter((b) => b.status === "open").length}
              </div>
              <Link to="/app/blood" className="text-[11px] text-rose-600 hover:underline mt-1 inline-block">
                View hospital needs &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Supplied by Our Bank</span>
                <Hospital className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{bankMatchedCount}</div>
              <span className="text-[11px] text-indigo-600 font-medium">Matched requests</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Critical Needs</span>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allBlood.filter((b) => b.urgency === "critical" && b.status === "open").length}
              </div>
              <Link to="/app/blood" className="text-[11px] text-red-600 hover:underline mt-1 inline-block">
                Urgent priority &rarr;
              </Link>
            </div>
          </>
        )}

        {isAdm && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{pendingVerifications.length}</div>
              <Link to="/app/verifications" className="text-[11px] text-indigo-600 hover:underline mt-1 inline-block">
                Review organizations &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Emergencies</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {allEmergency.filter((e) => e.status === "open").length}
              </div>
              <Link to="/app/emergency" className="text-[11px] text-amber-600 hover:underline mt-1 inline-block">
                Incident board &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Goods in Network</span>
                <Share2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{allResources.length}</div>
              <Link to="/app/resources" className="text-[11px] text-indigo-600 hover:underline mt-1 inline-block">
                All resources &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Surplus Meals</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{allFood.length}</div>
              <Link to="/app/food" className="text-[11px] text-emerald-600 hover:underline mt-1 inline-block">
                All food rescues &rarr;
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Role-Specific Main Section & Feeds */}
      {/* 1. RECEIVER VIEW */}
      {isRec && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* My Active Requests & Needs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  My Requests & Needs
                </h3>
                <span className="text-xs text-slate-400">
                  {myResourcesRequested.length + myFoodRequested.length + myBloodRequested.length + myEmergenciesRequested.length} submitted
                </span>
              </div>

              {myResourcesRequested.length + myFoodRequested.length + myBloodRequested.length + myEmergenciesRequested.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">You have not submitted any requests yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Browse available goods or request emergency aid whenever needed.</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Link
                      to="/app/resources"
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                    >
                      Browse Goods
                    </Link>
                    <Link
                      to="/app/food"
                      className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                    >
                      Find Food
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myEmergenciesRequested.map((em) => (
                    <div key={`em-${em.id}`} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Emergency: {em.request_type}
                        </span>
                        <UrgencyBadge urgency={em.urgency} />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{em.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>{em.address_text || "Mysuru"}</span>
                        <StatusBadge status={em.status} />
                      </div>
                    </div>
                  ))}

                  {myFoodRequested.map((f) => (
                    <div key={`food-${f.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                          Food: {f.title}
                        </span>
                        <StatusBadge status={f.status} />
                      </div>
                      <p className="text-xs text-slate-500">{f.quantity_servings} servings requested</p>
                    </div>
                  ))}

                  {myResourcesRequested.map((r) => (
                    <div key={`res-${r.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                          Resource: {r.title}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-slate-500">{r.category} &bull; {r.condition} condition</p>
                    </div>
                  ))}

                  {myBloodRequested.map((b) => (
                    <div key={`blood-${b.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Droplet className="w-3.5 h-3.5 text-rose-600" />
                          Blood Needed: {b.blood_group} ({b.units_needed} units)
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-500">{b.hospital_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Mysuru Community Coordination Map</h3>
                <span className="text-[11px] text-slate-400">Live Relief Locations</span>
              </div>
              <MapView items={[...allEmergency, ...allResources, ...allFood]} height="320px" />
            </div>
          </div>

          {/* Receiver Right Sidebar: Available Goods & Food Feed */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Available Surplus Food</h3>
                <Link to="/app/food" className="text-xs text-emerald-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allFood.filter((f) => f.status === "available").slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        {item.quantity_servings} servings
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.address_text || "Mysuru"}</p>
                  </div>
                ))}
                {allFood.filter((f) => f.status === "available").length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No surplus meals listed right now</p>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Available Goods & Items</h3>
                <Link to="/app/resources" className="text-xs text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allResources.filter((r) => r.status === "available").slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium capitalize">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.address_text || "Mysuru"}</p>
                  </div>
                ))}
                {allResources.filter((r) => r.status === "available").length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No resources available right now</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DONOR VIEW */}
      {isDon && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* My Active Listings & Donations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  My Donation Contributions
                </h3>
                <span className="text-xs text-slate-400">
                  {myGoodsDonated.length + myFoodDonated.length + myBloodOffers.length} listings
                </span>
              </div>

              {myGoodsDonated.length + myFoodDonated.length + myBloodOffers.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">You haven't listed any items or food donations yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Share surplus goods or offer life-saving blood donations to help our community.</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Link
                      to="/app/resources"
                      className="text-xs font-semibold text-white bg-indigo-600 px-3.5 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Share Resource
                    </Link>
                    <Link
                      to="/app/food"
                      className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                    >
                      Donate Food
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myGoodsDonated.map((r) => (
                    <div key={`res-${r.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                          {r.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {r.category} &bull; Qty: {r.quantity} &bull; {r.condition}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}

                  {myFoodDonated.map((f) => (
                    <div key={`food-${f.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                          {f.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {f.quantity_servings} servings &bull; {f.address_text || "Mysuru"}
                        </div>
                      </div>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}

                  {myBloodOffers.map((b) => (
                    <div key={`blood-${b.id}`} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-950 flex items-center gap-2">
                          <Droplet className="w-3.5 h-3.5 text-rose-600" />
                          Blood Pledge: {b.blood_group} for {b.hospital_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{b.units_needed} units required</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Mysuru Community Map</h3>
                <span className="text-[11px] text-slate-400">Live Relief Pins</span>
              </div>
              <MapView items={[...allBlood, ...allEmergency]} height="320px" />
            </div>
          </div>

          {/* Donor Right Sidebar: Open Urgent Needs to Support */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Urgent Blood Requests</h3>
                <Link to="/app/blood" className="text-xs text-rose-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allBlood.filter((b) => b.status === "open").slice(0, 4).map((b) => (
                  <div key={b.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-600">{b.blood_group} Needed</span>
                      <UrgencyBadge urgency={b.urgency} />
                    </div>
                    <p className="text-xs text-slate-800 font-medium mt-1">{b.hospital_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{b.units_needed} units &bull; {b.address_text || "Mysuru"}</p>
                    <Link
                      to="/app/blood"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Offer to Donate &rarr;
                    </Link>
                  </div>
                ))}
                {allBlood.filter((b) => b.status === "open").length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No open blood requests</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VOLUNTEER VIEW */}
      {isVol && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Volunteer Active Missions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  My Active Assignments ({activeVolunteerAssignments.length})
                </h3>
                <span className="text-xs text-indigo-600 font-medium">Live Missions</span>
              </div>

              {activeVolunteerAssignments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">You currently have no active assignments.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Pick up a requested surplus food delivery or resource transport task below.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeVolunteerAssignments.map((task) => (
                    <div key={`${task.taskType}-${task.id}`} className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-indigo-600" />
                          {task.taskType}: {task.title || task.description}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="text-xs text-slate-600">{task.address_text || "Mysuru Delivery Route"}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">Assigned to you</span>
                        <Link
                          to={task.taskType === "Food Delivery" ? "/app/food" : task.taskType === "Resource Transport" ? "/app/resources" : "/app/emergency"}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          View Task &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliveries Needing a Volunteer */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Available Deliveries Needing a Volunteer ({pendingDeliveries.length})
                </h3>
              </div>

              {pendingDeliveries.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No deliveries waiting for a volunteer right now.</p>
              ) : (
                <div className="space-y-3">
                  {pendingDeliveries.slice(0, 5).map((item) => (
                    <div key={`${item.taskType}-${item.id}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                            {item.taskType}
                          </span>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{item.address_text || "Mysuru"}</div>
                      </div>
                      <Link
                        to={item.route}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Claim Task
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <MapView items={[...allFood, ...allResources, ...allEmergency]} height="320px" />
            </div>
          </div>

          {/* Volunteer Right: Completed Work & Urgent Emergency Responses */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Completed Work History ({completedVolunteerAssignments.length})
              </h3>
              {completedVolunteerAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No completed tasks yet. Keep up the good work!</p>
              ) : (
                <div className="space-y-2">
                  {completedVolunteerAssignments.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-950 line-clamp-1">{item.title || item.description}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">Fulfilled</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Crisis Calls Waiting for Responders</h3>
                <Link to="/app/emergency" className="text-xs text-rose-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allEmergency.filter((e) => e.status === "open").slice(0, 4).map((em) => (
                  <div key={em.id} className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-950 capitalize">{em.request_type}</span>
                      <UrgencyBadge urgency={em.urgency} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{em.description}</p>
                    <Link
                      to="/app/emergency"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Respond &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. NGO VIEW */}
      {isOrg && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!isVerifiedOrg ? (
              <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  Organization Credentials Under Verification
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Welcome to ResQLink. As an NGO or Community Partner ({user?.organization_name}), our team verifies organization credentials to protect relief distribution integrity.
                </p>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2 text-xs text-amber-900">
                  <div className="font-semibold">Current Access Status:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Browse real-time community map & available listings: <span className="text-emerald-600 font-medium">Enabled</span></li>
                    <li>Claim emergency dispatch missions: <span className="text-amber-700 font-medium">Locked (Pending Verification)</span></li>
                    <li>Publish mass relief resources: <span className="text-amber-700 font-medium">Locked (Pending Verification)</span></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Community Relief Dispatch Board
                  </h3>
                  <Link to="/app/emergency" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                    Emergency Dispatch Board <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {allEmergency.slice(0, 4).map((em) => (
                    <div key={em.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 capitalize">{em.request_type} Call</span>
                        <UrgencyBadge urgency={em.urgency} />
                      </div>
                      <p className="text-xs text-slate-600">{em.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>{em.address_text || "Mysuru District"}</span>
                        <StatusBadge status={em.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <MapView items={[...allEmergency, ...allResources, ...allFood]} height="340px" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">City Surplus Food Available</h3>
                <Link to="/app/food" className="text-xs text-emerald-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allFood.filter((f) => f.status === "available").slice(0, 4).map((f) => (
                  <div key={f.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{f.title}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{f.quantity_servings} svgs</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{f.address_text || "Mysuru"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BLOOD BANK VIEW: Specifically focused on blood bank operations only */}
      {isBB && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Hospital Blood Requests */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  Hospital Blood Supply Requirements ({bloodRequestsForBank.length})
                </h3>
                <Link to="/app/blood" className="text-xs text-rose-600 hover:underline">
                  Open Blood Portal &rarr;
                </Link>
              </div>

              {bloodRequestsForBank.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No open blood requests across regional hospitals.</p>
              ) : (
                <div className="space-y-3">
                  {bloodRequestsForBank.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700">
                            {req.blood_group}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{req.hospital_name}</span>
                        </div>
                        <UrgencyBadge urgency={req.urgency} />
                      </div>
                      <p className="text-xs text-slate-600">
                        {req.units_needed} units requested &bull; {req.address_text || "Mysuru Hospital"}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <StatusBadge status={req.status} />
                        {isVerifiedOrg && req.status === "open" && (
                          <Link
                            to="/app/blood"
                            className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition"
                          >
                            Supply Units &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blood Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Mysuru Blood Demand Map</h3>
                <span className="text-[11px] text-slate-400">Hospital Locations</span>
              </div>
              <MapView items={allBlood} height="320px" />
            </div>
          </div>

          {/* Blood Bank Profile Info & Operating Status */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-rose-600" />
                  Facility Profile
                </h3>
                <Link
                  to="/app/blood"
                  className="text-[11px] text-rose-600 font-semibold hover:underline"
                >
                  Manage &rarr;
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Facility Name</span>
                  <span className="font-semibold text-slate-800">{user?.organization_name || "Blood Bank Facility"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-medium text-slate-700">{user?.phone || myBloodBank?.contact_phone || "Not recorded"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Operating Location</span>
                  <span className="font-medium text-slate-700">{myBloodBank?.address_text || "Mysuru, Karnataka"}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Authorization</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${isVerifiedOrg ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {isVerifiedOrg ? "Officially Authorized" : "Verification in Progress"}
                  </span>
                </div>
              </div>
            </div>

            {/* Blood Supply Requirements Quick Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  Demand by Group
                </h3>
                <span className="text-[10px] text-slate-400">Hospital Needs</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((bg) => {
                  const needed = allBlood
                    .filter((b) => b.blood_group === bg && b.status === "open")
                    .reduce((sum, b) => sum + (Number(b.units_needed) || 1), 0);
                  return (
                    <div
                      key={bg}
                      className={`p-2 rounded-lg border ${
                        needed > 0
                          ? "bg-rose-50/70 border-rose-200 font-bold text-rose-800"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      }`}
                    >
                      <div className="text-[11px]">{bg}</div>
                      <div className="text-sm font-extrabold">{needed}u</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADMIN VIEW */}
      {isAdm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Organizations Pending Verification */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Organizations Awaiting Verification ({pendingVerifications.length})
                </h3>
                <Link to="/app/verifications" className="text-xs text-indigo-600 hover:underline">
                  Manage All &rarr;
                </Link>
              </div>

              {pendingVerifications.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No organizations currently pending verification. All accounts are up to date!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerifications.slice(0, 4).map((org) => (
                    <div key={org.id} className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          {org.organization_name || org.username}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Role: <span className="font-semibold uppercase">{org.role}</span> &bull; {org.email}
                        </div>
                      </div>
                      <Link
                        to="/app/verifications"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <MapView items={[...allEmergency, ...allResources, ...allFood, ...allBlood]} height="340px" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Critical Emergencies</h3>
                <Link to="/app/emergency" className="text-xs text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {allEmergency.slice(0, 4).map((em) => (
                  <div key={em.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 capitalize">{em.request_type}</span>
                      <UrgencyBadge urgency={em.urgency} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{em.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
