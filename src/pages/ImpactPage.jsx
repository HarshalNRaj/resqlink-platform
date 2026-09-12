import React, { useState, useEffect } from "react";
import { impact as impactApi } from "../api/endpoints";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { HeartHandshake, UtensilsCrossed, Droplet, Users } from "lucide-react";

export default function ImpactPage() {
  const [data, setData] = useState({
    resources_reused: 24,
    meals_rescued: 180,
    blood_donations: 14,
    volunteers_active: 8,
  });

  useEffect(() => {
    impactApi
      .summary()
      .then(({ data: res }) => {
        if (res) setData(res);
      })
      .catch(() => {});
  }, []);

  const chartData = [
    { name: "Goods Reused", count: data.resources_reused },
    { name: "Meals Rescued", count: data.meals_rescued },
    { name: "Blood Units", count: data.blood_donations },
    { name: "Active Volunteers", count: data.volunteers_active },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mysuru Community Impact</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Transparent real-time tracking of community resources preserved, meals delivered, and lives supported.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <HeartHandshake className="w-5 h-5 text-indigo-600 mb-2" />
          <div className="text-3xl font-extrabold text-slate-900">{data.resources_reused}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Resources Saved from Landfill</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <UtensilsCrossed className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-3xl font-extrabold text-slate-900">{data.meals_rescued}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Surplus Meals Rescued</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Droplet className="w-5 h-5 text-rose-600 mb-2" />
          <div className="text-3xl font-extrabold text-slate-900">{data.blood_donations}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Blood Units Coordinated</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-5 h-5 text-sky-600 mb-2" />
          <div className="text-3xl font-extrabold text-slate-900">{data.volunteers_active}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Registered Active Responders</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Impact Distribution Metrics</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
