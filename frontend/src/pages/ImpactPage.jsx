import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { impact as api } from "../api/endpoints";
import { Card } from "../components/ui";

export default function ImpactPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.summary().then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="text-sm text-ink-soft">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Impact dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Every number below is pulled live from completed records — nothing here is made up.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Items reused" value={stats.items_reused} />
        <Stat label="Food portions rescued" value={stats.food_portions_rescued} />
        <Stat label="Blood units fulfilled" value={stats.blood_units_fulfilled} />
        <Stat label="Emergencies fulfilled" value={stats.emergencies_fulfilled} />
        <Stat label="Active listings" value={stats.active_listings} />
        <Stat label="Open emergencies" value={stats.open_emergencies} />
        <Stat label="Open blood requests" value={stats.open_blood_requests} />
      </div>

      {stats.monthly_items_reused?.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-display font-semibold text-ink">Items reused by month</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly_items_reused}>
                <XAxis dataKey="month" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F5C56" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="font-stat mt-1 text-2xl font-bold text-primary-700">{value}</p>
    </Card>
  );
}
