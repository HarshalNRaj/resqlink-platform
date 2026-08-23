# ResQLink

A community platform that connects unused resources with people who need
them — donation & reuse, surplus food rescue, blood request coordination,
and emergency support — in one workflow instead of four disconnected ones.

Every listing moves through the same chain: **available → requested →
assigned → completed**, and completions feed a real (not fabricated)
impact dashboard.

## Stack

- **Backend:** Django + Django REST Framework, JWT auth (SimpleJWT),
  SQLite by default (MySQL-ready via env vars)
- **Frontend:** React (Vite) + Tailwind CSS v4, React Router, Leaflet/
  OpenStreetMap for maps, Recharts for the impact dashboard

## Project layout

```
resqlink/
├── backend/         Django REST API
│   ├── apps/
│   │   ├── accounts/       custom User model, JWT auth, roles
│   │   ├── resources/      donation/reuse/recycling module
│   │   ├── food/           surplus food rescue module
│   │   ├── blood/          blood requests, donor & blood-bank matching
│   │   ├── emergency/      emergency support requests
│   │   ├── notifications/  in-app notifications
│   │   ├── impact/         aggregated dashboard stats
│   │   └── common/         shared lifecycle model + permissions
│   └── config/             Django project settings/urls
└── frontend/         React app (Vite)
    └── src/
        ├── api/            axios client + endpoint helpers
        ├── context/        auth context (JWT session)
        ├── components/     shared UI (layout, cards, map, badges)
        └── pages/          one page per route
```

## Running the backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py seed_demo      # optional: creates demo accounts + listings
python3 manage.py runserver
```

API is now at `http://localhost:8000/api/`. Admin site at `/admin/`
(login with the seeded `admin` / `admin1234`, or create your own with
`python3 manage.py createsuperuser`).

**Switching to MySQL** (as in the original synopsis): set these env vars
before running `migrate`/`runserver` — no code changes needed:

```bash
export DB_ENGINE=mysql
export DB_NAME=resqlink
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_HOST=localhost
export DB_PORT=3306
pip install mysqlclient   # uncomment it in requirements.txt first
```

### Demo accounts (from `seed_demo`)

| Username | Password | Role |
|---|---|---|
| admin | admin1234 | Admin (superuser) |
| asha_donor | password123 | Donor |
| ravi_volunteer | password123 | Volunteer |
| hope_ngo | password123 | NGO |
| citycare_bloodbank | password123 | Blood bank |
| meera | password123 | General user |

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. It talks to the backend at the URL in
`.env` (`VITE_API_BASE`, defaults to `http://localhost:8000/api`).

For a production build: `npm run build` → output in `frontend/dist/`.

## How the core flow works

1. Someone lists a resource, food surplus, blood need, or emergency.
2. Another user requests/claims it (blood & emergency have their own
   matching flow — a donor offers, a blood bank commits, a volunteer/NGO
   claims).
3. A volunteer is assigned to move it (resources & food) or a responder
   takes charge (emergency); a match commits units (blood).
4. It's marked complete/fulfilled — this is what the impact dashboard
   counts, and everyone involved gets a notification.

Each module enforces this with server-side status transitions (see
`apps/<module>/views.py`) — the frontend just calls the relevant action
endpoint (`/request_item/`, `/assign/`, `/complete/`, etc.) and reflects
whatever the API returns.

## Status: fully built and tested

Both backend and frontend are complete:
- All 4 modules (resources, food, blood, emergency) + auth, notifications,
  and impact dashboard are implemented and were verified end-to-end
  against the running API (request → assign/match → complete/fulfill →
  notification fired → impact numbers updated correctly).
- The frontend has every page wired up: landing, login/register, role
  dashboard, all 4 module pages (list/create/act), impact dashboard with
  a chart, profile page, and an admin verification queue for NGOs/blood
  banks. `npm run build` completes with no errors.

## What's deliberately kept simple

- No real-time push — notifications poll every 20s.
- No file/image uploads — listings are text + location only.
- Location is manual lat/lng plus a free-text address, not a geocoding
  service — Leaflet/OpenStreetMap render whatever coordinates you give it.
- No payment or logistics tracking — ResQLink coordinates the *connection*,
  not the delivery logistics themselves.

These are straightforward to extend once the core loop is working end to
end, which it now does.
