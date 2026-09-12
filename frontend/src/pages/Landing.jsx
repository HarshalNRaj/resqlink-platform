import { ArrowRight, Droplet, Package, Siren, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const FLOW = [
  { n: "01", label: "Resource", detail: "An item, a meal, a unit of blood, or a need is listed." },
  { n: "02", label: "Need", detail: "The platform matches it against someone who's asked." },
  { n: "03", label: "Connection", detail: "A volunteer, donor, or organization steps in." },
  { n: "04", label: "Impact", detail: "Completion is logged — for real, on the dashboard." },
];

const MODULES = [
  { icon: Package, title: "Donate & reuse", body: "Clothes, electronics, furniture, books — matched to someone nearby who needs them." },
  { icon: UtensilsCrossed, title: "Food rescue", body: "Surplus from restaurants and events, routed to NGOs before it goes to waste." },
  { icon: Droplet, title: "Blood coordination", body: "Requesters, registered donors, and blood banks — one open board, not scattered appeals." },
  { icon: Siren, title: "Emergency support", body: "Shelter, transport, supplies, volunteers — raised with urgency, tracked to closure." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-ink px-4 py-3 text-center text-white">
        <p className="editorial-kicker text-xs tracking-[0.28em]">Free community sharing is now live in your area</p>
      </div>
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-line px-6 py-5">
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#catalogue" className="editorial-kicker text-ink-soft hover:text-primary-500">Catalogue</a>
          <a href="#about" className="editorial-kicker text-ink-soft hover:text-primary-500">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 font-display text-base font-bold text-white">
            R
          </div>
          <span className="font-display text-2xl italic text-ink">resqlink</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#journal" className="hidden editorial-kicker text-ink-soft hover:text-primary-500 sm:block">Journal</a>
          <Link to="/login" className="editorial-kicker text-ink-soft hover:text-primary-500">Sign in</Link>
          <Link to="/register" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-primary-500">
            Join
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="about" className="mx-auto max-w-6xl border-b border-line px-6 pb-20 pt-20 text-center md:pt-28">
        <p className="editorial-kicker text-primary-500">Join the movement</p>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl leading-[0.98] text-ink md:text-7xl">
          Empowering neighbors through <span className="italic text-primary-500">shared resources.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-ink-soft">
          Connect, borrow, and lend within your local community. ResQLink brings people,
          useful things, and urgent needs together.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600">
            Browse the catalogue <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="hidden items-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-primary-500 sm:inline-flex">
            I already have one
          </Link>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
          <div>
            <p className="editorial-kicker text-primary-500">The shelves</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Community favorites</h2>
          </div>
          <span className="hidden font-mono text-xs text-ink-soft sm:block">NO. 01 — 04</span>
        </div>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="editorial-kicker text-ink-soft">What we are pressing into hands</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              One thoughtful connection can change a whole neighborhood.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-ink-soft">
              From furniture and meals to blood and emergency support, every listing follows
              a clear path from someone who can help to someone who needs it.
            </p>
          </div>

          <div className="border-y border-line bg-surface p-6">
            <p className="editorial-kicker mb-5 text-ink-soft">
              Every listing follows the same chain
            </p>
            <div className="space-y-0">
              {FLOW.map((step, i) => (
                <div key={step.n} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < FLOW.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-full w-px bg-line" />
                  )}
                  <span className="font-stat flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-ink">{step.label}</p>
                    <p className="text-sm text-ink-soft">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Four modules */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="font-display text-2xl font-bold text-ink">Four needs. One workflow.</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 font-display font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-primary-700 px-8 py-10 text-white md:px-12">
          <h2 className="font-display text-2xl font-bold">Built around every role in the network</h2>
          <p className="mt-2 max-w-xl text-primary-50/90">
            General users, donors, volunteers, NGOs, blood banks, and administrators each
            get their own dashboard — role-based access, not one screen trying to be everything.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["General user", "Donor", "Volunteer", "NGO", "Blood bank", "Admin"].map((r) => (
              <span key={r} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">{r}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-ink-soft">
        ResQLink — built for a smaller, more accountable set of promises kept.
      </footer>
    </div>
  );
}
