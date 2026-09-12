import React from "react";
import { Link } from "react-router-dom";
import { Share2, UtensilsCrossed, Droplet, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              R
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">ResQLink</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm"
            >
              Join Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          Community Resource & Emergency Coordination
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Connecting Mysuru with critical resources and emergency relief
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          ResQLink empowers neighbors, NGOs, volunteers, and blood banks to bridge supply gaps, rescue surplus food, and respond instantly in times of crisis.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md transition"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* 4 Pillars */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <Share2 className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Goods Reuse</h3>
            <p className="text-xs text-slate-500 mt-1">Pass on clothing, furniture, and medical aids directly to those in need.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Food Rescue</h3>
            <p className="text-xs text-slate-500 mt-1">Direct surplus meals from caterers and restaurants to community shelters.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <Droplet className="w-6 h-6 text-rose-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Blood Emergency</h3>
            <p className="text-xs text-slate-500 mt-1">Instant matching between hospital emergencies, donors, and certified blood banks.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">SOS Dispatch</h3>
            <p className="text-xs text-slate-500 mt-1">Live geolocation dispatching for volunteers and disaster response teams.</p>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        ResQLink &bull; Mysuru Community Resource Coordination Platform
      </footer>
    </div>
  );
}
