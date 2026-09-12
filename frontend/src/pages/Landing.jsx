import { ArrowRight, Droplet, HeartHandshake, Package, Siren, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const FLOW = [
  { n: "No. 01", label: "Resource Listing", detail: "Surplus meals, reusable items, or urgent medical requests logged in moments." },
  { n: "No. 02", label: "Proximity Matching", detail: "Instant local routing connects verified donors, volunteers, and neighbors." },
  { n: "No. 03", label: "Direct Handover", detail: "Transparent chain of custody and coordinated dispatch without middleman delays." },
  { n: "No. 04", label: "Verified Impact", detail: "Every rescue, portion, and donation recorded into community impact records." },
];

const MODULES = [
  {
    icon: Package,
    eyebrow: "Community Shelf",
    title: "Resource Sharing",
    body: "Books, electronics, medical equipment, and appliances catalogued for direct local reuse.",
    link: "/login",
  },
  {
    icon: UtensilsCrossed,
    eyebrow: "Surplus Rescue",
    title: "Food Rescue",
    body: "Direct routing of edible excess from dining halls and events to nearby community kitchens.",
    link: "/login",
  },
  {
    icon: Droplet,
    eyebrow: "Urgent Care",
    title: "Blood Registry",
    body: "Live coordination between hospitals, registered voluntary donors, and emergency desks.",
    link: "/login",
  },
  {
    icon: Siren,
    eyebrow: "Emergency Desk",
    title: "Crisis Support",
    body: "Rapid-response shelter, transport, essential supplies, and volunteer mobilisation.",
    link: "/login",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F2E9D8] text-[#1A1410] overflow-x-hidden">
      {/* Top Notice Bar from template */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1A0E0A] py-2 px-4 text-center font-mono text-[11px] tracking-[0.24em] text-[#F2E9D8] uppercase border-b border-black/10"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
        Free community resource & emergency sharing network is live in your area
      </motion.div>

      {/* Editorial Header */}
      <header className="sticky top-0 z-50 border-b border-[#1A1410]/10 bg-[#F2E9D8]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-7">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#1A1410] lowercase transition-transform group-hover:scale-[1.02]">
                resqlink
              </span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#modules" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1A1410] opacity-80 hover:opacity-100 transition-opacity">
                Services
              </a>
              <a href="#lifecycle" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1A1410] opacity-80 hover:opacity-100 transition-opacity">
                How It Works
              </a>
              <a href="#roles" className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1A1410] opacity-80 hover:opacity-100 transition-opacity">
                Network
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#1A1410] opacity-80 hover:opacity-100 transition-opacity"
            >
              Sign in
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-block rounded-md bg-[#2C3A2C] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F2E9D8] hover:bg-[#1B241B] transition-colors shadow-sm"
              >
                Join network
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#6B1F1F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6B1F1F] animate-ping" />
              Join the Movement · Community Registry
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] text-[#1A1410] tracking-tight">
              Empowering Neighbors Through{" "}
              <span className="italic font-normal text-[#2C3A2C]">Shared Resources.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3D3027] font-serif">
              Connect, borrow, donate, and lend within your local community. A single
              dignified ledger for food rescue, voluntary blood mobilization, reusable goods,
              and immediate crisis relief.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-md bg-[#2C3A2C] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-[#F2E9D8] hover:bg-[#1B241B] transition-colors shadow-sm"
                >
                  Browse Catalogue <ArrowRight size={15} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-[#1A1410]/20 bg-[#FFFFFF] px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-[#1A1410] hover:bg-[#F9F5EC] transition-colors"
                >
                  Member Portal
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Lifecycle Card */}
          <motion.div
            id="lifecycle"
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="rounded-xl border border-[#1A1410]/15 bg-[#FFFFFF] p-7 shadow-[0_10px_30px_rgba(26,20,16,0.06)]">
              <div className="flex items-center justify-between border-b border-[#1A1410]/10 pb-4 mb-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6B1F1F]">
                  Staff Picks & Flow
                </span>
                <span className="font-serif italic text-sm text-[#3D3027]">Mutual Aid Protocol</span>
              </div>
              <div className="space-y-6">
                {FLOW.map((step, idx) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08, duration: 0.35 }}
                    className="flex gap-4 items-start group"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#2C3A2C] font-semibold pt-0.5 shrink-0 group-hover:text-[#6B1F1F] transition-colors">
                      {step.n}
                    </span>
                    <div>
                      <h4 className="font-serif text-lg font-medium text-[#1A1410] leading-snug">
                        {step.label}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#3D3027]/80 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules/Shelves Section */}
      <section id="modules" className="border-t border-[#1A1410]/10 bg-[#EADFC8]/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#6B1F1F]">
                The Shelves & Services
              </span>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl font-normal text-[#1A1410]">
                Community Favorites & Urgent Relief
              </h2>
            </div>
            <p className="mt-3 md:mt-0 font-serif italic text-[#3D3027] max-w-md text-sm">
              The most requested items and dispatch lines currently available across the network.
            </p>
          </div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {MODULES.map(({ icon: Icon, eyebrow, title, body, link }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex flex-col justify-between rounded-xl border border-[#1A1410]/12 bg-[#FFFFFF] p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6B1F1F]">
                      {eyebrow}
                    </span>
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2C3A2C]/10 text-[#2C3A2C]"
                    >
                      <Icon size={18} />
                    </motion.div>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#1A1410]">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#3D3027]">{body}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1A1410]/10 flex items-center justify-between">
                  <Link
                    to={link}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2C3A2C] group-hover:text-[#6B1F1F] transition-colors flex items-center gap-1.5"
                  >
                    Open View <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Network Roles Section with Forest Green Background */}
      <section id="roles" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-[#2C3A2C] px-8 py-14 text-[#F2E9D8] md:px-14 shadow-lg"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#EADFC8]/70">
            Participant Directory
          </span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-normal leading-snug">
            Tailored consoles for every custodian in the ecosystem.
          </h2>
          <p className="mt-4 max-w-2xl font-serif text-[#EADFC8]/90 text-base leading-relaxed">
            Donors, food handlers, volunteers, accredited NGOs, certified blood banks, and municipal
            coordinators each operate on specialized dashboards with transparent permission boundaries.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {[
              "General Citizen",
              "Resource Donor",
              "Field Volunteer",
              "Accredited NGO",
              "Blood Bank Coordinator",
              "Emergency Dispatcher",
            ].map((role, idx) => (
              <motion.span
                key={role}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(27, 36, 27, 0.9)" }}
                transition={{ duration: 0.15 }}
                className="cursor-default rounded-full border border-[#F2E9D8]/20 bg-[#1B241B]/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F2E9D8]"
              >
                {role}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Template-matching Footer */}
      <footer className="bg-[#1A0E0A] text-[#F2E9D8] pt-16 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#F2E9D8]/50">
            <span className="w-16 h-px bg-current opacity-40"></span>
            — § —
            <span className="w-16 h-px bg-current opacity-40"></span>
          </div>

          <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-[#F2E9D8]/10">
            <div className="md:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#F2E9D8]/70 block mb-3">
                resqlink
              </span>
              <h3 className="font-serif italic text-3xl font-medium text-[#F2E9D8] leading-tight">
                resqlink platform
              </h3>
              <p className="mt-3 text-sm text-[#F2E9D8]/70 max-w-sm font-serif">
                A quiet, resilient dispatch for neighbor-to-neighbor mutual aid, food salvage,
                and emergency health assistance.
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#F2E9D8]/70 block mb-3">
                Navigation
              </span>
              <ul className="space-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#F2E9D8]/80">
                <li><Link to="/login" className="hover:text-white transition-colors">Resource Catalogue</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Emergency Board</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Blood Registry</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Food Salvage</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#F2E9D8]/70 block mb-3">
                Membership
              </span>
              <ul className="space-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#F2E9D8]/80">
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><span className="text-[#F2E9D8]/40">Status: Operational</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono tracking-widest text-[#F2E9D8]/50 uppercase">
            <span>© ResQLink Platform · Open Mutual Aid</span>
            <span className="mt-2 sm:mt-0">Crafted with Bookhouse Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
