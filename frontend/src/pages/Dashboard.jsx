import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resources, food, blood, emergency, impact as impactApi } from "../api/endpoints";
import { Card } from "../components/ui";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const role = user?.role;
  const isDonor = role === "donor";
  const isResponder = role === "volunteer" || role === "ngo";
  const isReceiver = role === "receiver" || role === "general";

  const [stats, setStats] = useState(null);
  const [myResources, setMyResources] = useState([]);
  const [myFood, setMyFood] = useState([]);
  const [myBlood, setMyBlood] = useState([]);
  const [myEmergency, setMyEmergency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (typeof refreshUser === "function") {
          await refreshUser();
        }

        const [statsRes, resourcesRes, foodRes, bloodRes, emergencyRes] =
          await Promise.all([
            impactApi.summary(),
            resources.list({
              mine: isResponder ? "volunteering" : isReceiver ? "requested" : "owned",
            }),
            food.list({
              mine: isResponder ? "volunteering" : isReceiver ? "requested" : "provided",
            }),
            blood.list({ mine: isReceiver ? "requested" : "matched" }),
            emergency.list({ mine: isResponder ? "assigned" : "requested" }),
          ]);

        if (!mounted) return;

        setStats(statsRes.data);
        setMyResources(resourcesRes.data?.results || resourcesRes.data || []);
        setMyFood(foodRes.data?.results || foodRes.data || []);
        setMyBlood(bloodRes.data?.results || bloodRes.data || []);
        setMyEmergency(emergencyRes.data?.results || emergencyRes.data || []);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load dashboard. Please check your connection and try again."
        );
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isReceiver, isResponder, refreshKey, refreshUser]);

  const title = isDonor ? "Your donations" : isResponder ? "Your response work" : "Your requests";
  const intro = isDonor
    ? "Share useful items, food, or blood with people nearby."
    : isResponder
      ? "Track the pickups and emergency responses you are handling."
      : "Track the help you have requested and the support on its way.";

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="mt-4 text-sm text-ink-soft">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="py-8 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-ink-soft">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Welcome, {user?.first_name || user?.username}
      </h1>
      <p className="mt-1 text-sm text-ink-soft capitalize">Role: {user?.role?.replace("_", " ")}</p>
      <p className="mt-4 max-w-xl text-sm text-ink-soft">{intro}</p>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card><p className="text-xs text-ink-soft">Items reused</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.items_reused}</p></Card>
          <Card><p className="text-xs text-ink-soft">Food portions rescued</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.food_portions_rescued}</p></Card>
          <Card><p className="text-xs text-ink-soft">Blood units fulfilled</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.blood_units_fulfilled}</p></Card>
          <Card><p className="text-xs text-ink-soft">Emergencies fulfilled</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.emergencies_fulfilled}</p></Card>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Section title={isDonor ? "Items you are donating" : isResponder ? "Resource deliveries" : "Requested items"} viewAll="/app/resources" items={myResources} empty={isDonor ? "You have not listed any items yet." : "No resource activity yet."} />
        <Section title={isDonor ? "Food you are rescuing" : isResponder ? "Food deliveries" : "Requested food"} viewAll="/app/food" items={myFood} empty="No food activity yet." />
        <Section title={isDonor ? "Blood commitments" : "Your blood requests"} viewAll="/app/blood" items={myBlood} empty="No blood activity yet." nameKey={(r) => `${r.blood_group} × ${r.units_needed} — ${r.hospital_name}`} />
        <Section title={isResponder ? "Assigned emergencies" : "Your emergency requests"} viewAll="/app/emergency" items={myEmergency} empty="No emergency activity yet." nameKey={(r) => r.request_type} />
      </div>
    </div>
  );
}

function Section({ title, viewAll, items, empty, nameKey }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-ink">{title}</h2>
        <Link to={viewAll} className="text-xs font-semibold text-primary-600 hover:underline">View all</Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 5).map((it) => (
            <li key={it.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
              <span className="truncate">{nameKey ? nameKey(it) : it.title}</span>
              <StatusBadge status={it.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
