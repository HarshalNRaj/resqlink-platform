import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-line pb-4 mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B1F1F]">
            Member Overview
          </span>
          <h1 className="font-serif text-3xl font-medium text-ink mt-1">
            Welcome, {user?.first_name || user?.username}
          </h1>
        </div>
        <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mt-2 sm:mt-0">
          Role: <span className="text-[#2C3A2C] font-semibold">{user?.role?.replace("_", " ")}</span>
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Items Reused", value: stats.items_reused, color: "text-[#2C3A2C]" },
            { label: "Food Portions Rescued", value: stats.food_portions_rescued, color: "text-[#2C3A2C]" },
            { label: "Blood Units Fulfilled", value: stats.blood_units_fulfilled, color: "text-[#6B1F1F]" },
            { label: "Emergencies Fulfilled", value: stats.emergencies_fulfilled, color: "text-[#6B1F1F]" },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              whileHover={{ y: -3 }}
            >
              <Card className="border-[#1A1410]/12">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted block">{item.label}</span>
                <p className={`font-serif text-3xl font-normal ${item.color} mt-2`}>{item.value}</p>
              </Card>
            </motion.div>
          ))}
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
    <Card className="border-[#1A1410]/12">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="font-serif text-lg font-medium text-ink">{title}</h2>
        <Link to={viewAll} className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#2C3A2C] hover:text-[#6B1F1F] transition-colors">
          View all →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-xs font-mono text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.slice(0, 5).map((it, idx) => (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className="flex items-center justify-between rounded-md border border-line bg-surface-soft/40 px-3 py-2 text-xs"
            >
              <span className="truncate font-medium text-ink">{nameKey ? nameKey(it) : it.title}</span>
              <StatusBadge status={it.status} />
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
