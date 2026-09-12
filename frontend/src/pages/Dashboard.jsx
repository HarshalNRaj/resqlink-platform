import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resources, food, blood, emergency, impact as impactApi } from "../api/endpoints";
import { Card } from "../components/ui";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myResources, setMyResources] = useState([]);
  const [myFood, setMyFood] = useState([]);
  const [myBlood, setMyBlood] = useState([]);
  const [myEmergency, setMyEmergency] = useState([]);

  useEffect(() => {
    impactApi.summary().then(({ data }) => setStats(data)).catch(() => {});
    resources.list({ mine: "owned" }).then(({ data }) => setMyResources(data.results || data)).catch(() => {});
    food.list({ mine: "provided" }).then(({ data }) => setMyFood(data.results || data)).catch(() => {});
    blood.list({ mine: "requested" }).then(({ data }) => setMyBlood(data.results || data)).catch(() => {});
    emergency.list({ mine: "requested" }).then(({ data }) => setMyEmergency(data.results || data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Welcome, {user?.first_name || user?.username}
      </h1>
      <p className="mt-1 text-sm text-ink-soft capitalize">Role: {user?.role?.replace("_", " ")}</p>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card><p className="text-xs text-ink-soft">Items reused</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.items_reused}</p></Card>
          <Card><p className="text-xs text-ink-soft">Food portions rescued</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.food_portions_rescued}</p></Card>
          <Card><p className="text-xs text-ink-soft">Blood units fulfilled</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.blood_units_fulfilled}</p></Card>
          <Card><p className="text-xs text-ink-soft">Emergencies fulfilled</p><p className="font-stat text-2xl font-bold text-primary-700">{stats.emergencies_fulfilled}</p></Card>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Section title="Your resource listings" viewAll="/app/resources" items={myResources} empty="You haven't listed anything yet." />
        <Section title="Your food listings" viewAll="/app/food" items={myFood} empty="No food listings yet." />
        <Section title="Your blood requests" viewAll="/app/blood" items={myBlood} empty="No blood requests yet." nameKey={(r) => `${r.blood_group} × ${r.units_needed} — ${r.hospital_name}`} />
        <Section title="Your emergency requests" viewAll="/app/emergency" items={myEmergency} empty="No emergency requests yet." nameKey={(r) => r.request_type} />
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
