import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { impact as api } from "../api/endpoints";
import { Card } from "../components/ui";

export default function ImpactPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.summary().then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="text-sm font-mono text-ink-muted">Loading impact ledger…</p>;

  return (
    <div>
      <div className="border-b border-line pb-4 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B1F1F]">Verified Audit</span>
        <h1 className="font-serif text-3xl font-medium text-ink mt-1">Community Impact</h1>
        <p className="mt-1 text-sm font-serif text-ink-soft">
          Every figure below is drawn live from verified, completed dispatches across the network.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Items reused", value: stats.items_reused, color: "text-[#2C3A2C]" },
          { label: "Food portions rescued", value: stats.food_portions_rescued, color: "text-[#2C3A2C]" },
          { label: "Blood units fulfilled", value: stats.blood_units_fulfilled, color: "text-[#6B1F1F]" },
          { label: "Emergencies fulfilled", value: stats.emergencies_fulfilled, color: "text-[#6B1F1F]" },
          { label: "Active listings", value: stats.active_listings, color: "text-ink" },
          { label: "Open emergencies", value: stats.open_emergencies, color: "text-[#6B1F1F]" },
          { label: "Open blood requests", value: stats.open_blood_requests, color: "text-[#6B1F1F]" },
        ].map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            whileHover={{ y: -3 }}
          >
            <Card className="border-[#1A1410]/12">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted block">{s.label}</span>
              <p className={`font-serif text-3xl font-normal ${s.color} mt-2`}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {stats.monthly_items_reused?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <Card className="mt-6 border-[#1A1410]/12">
            <h2 className="font-serif text-xl font-medium text-ink">Items reused by month</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_items_reused}>
                  <XAxis dataKey="month" fontSize={11} stroke="#6E5E52" />
                  <YAxis allowDecimals={false} fontSize={11} stroke="#6E5E52" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F2E9D8",
                      borderColor: "#2C3A2C",
                      borderRadius: 6,
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#2C3A2C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
