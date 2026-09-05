# GATE — Geo Attendance Tracking Engine

QR-based, geo-verified attendance for events and classes. An attendee scans the event's QR
code, the browser captures their live GPS fix, and the server only records attendance if they
are physically inside the venue's geofence. One check-in per person, enforced at the database
level. Organizers get a dashboard with search, filter, and one-click CSV export.

Built on the MERN stack (MongoDB · Express · React · Node).

---

## Features

- **Auth & roles** — JWT-based register/login with two roles: `organizer` and `attendee`.
- **Event management** — organizers create/edit/delete events with venue, date/time, map
  location, and a configurable geofence radius (default 150 m).
- **Unique QR per event** — each event gets its own auto-generated QR token; the QR is served
  as a data URL and shown on a clean white card so it stays scannable.
- **Camera scanning** — attendees scan with `html5-qrcode` straight from the browser.
- **Geofence verification** — the server resolves the scanned token to an event, computes the
  Haversine distance between the attendee's GPS position and the venue, and rejects check-ins
  outside the radius.
- **No duplicate check-ins** — a unique compound index on `(event, user)` makes a second
  check-in impossible.
- **Organizer dashboard** — attendee list with live search, per-event stats, and CSV export
  with all required columns.
- **Interactive venue map** — a Leaflet map on the create/edit screen; click or drag to drop
  the venue pin, and the geofence circle scales with the radius.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + Vite, React Router, Axios, `html5-qrcode`, Leaflet (keyless OpenStreetMap tiles) |
| Backend | Node + Express, Mongoose, `jsonwebtoken`, `bcryptjs`, `qrcode` |
| Database | MongoDB (Atlas or local) |
| Styling | Hand-written CSS design system — pure-black dark theme, Archivo / Space Grotesk / Inter, CSS-only animation and an animated grid background |

## Project structure

```
backend/          Express + MongoDB API
  src/
    controllers/  auth, event, attendance
    models/       User, Event, Attendance
    routes/       route definitions
    middleware/   auth guard, error handler
    utils/        geo (Haversine), qr, csv
frontend/         React (Vite) app
  src/
    pages/        Landing, Login, Register, dashboards, ScanPage
    components/   Navbar, PrivateRoute, GeoMap, Reveal
    context/      AuthContext
    api/          axios instance
    styles.css    single cohesive design system
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string — a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  M0 cluster works (create a DB user, and under **Network Access** allow `0.0.0.0/0` for a
  dev project).

### 1. Backend

```bash
cd backend
cp .env.example .env      # paste your MONGO_URI, set a long random JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

`.env` keys:

| Key | Example |
|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/attendance-app` |
| `JWT_SECRET` | any long random string |
| `PORT` | `5000` |

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api is correct for local dev
npm install
npm run dev               # http://localhost:5173
```

### 3. Try it

Open http://localhost:5173. Register two accounts (use a second browser profile or an
incognito window for the attendee):

1. **Organizer** — create an event; use "Use my location" or click the map so the geofence
   check can actually pass. Open **Manage / QR / Attendance** to show the QR.
2. **Attendee** — open the event, hit **Scan to Mark Attendance**, scan the organizer's QR,
   and allow camera + location access.

> Camera and geolocation need HTTPS in the browser — except on `localhost`, which is exempt.
> Local dev works as-is; any deployment must be served over HTTPS.

---

## API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | create account (`role`: `organizer` or `attendee`) |
| POST | `/api/auth/login` | — | returns JWT |
| GET | `/api/auth/me` | ✔ | current user |
| GET | `/api/events?search=` | ✔ | list events (organizer sees only their own) |
| POST | `/api/events` | organizer | create event (auto-generates QR token) |
| GET | `/api/events/:id` | ✔ | event detail |
| PUT | `/api/events/:id` | organizer | edit event |
| DELETE | `/api/events/:id` | organizer | delete event |
| GET | `/api/events/:id/qrcode` | organizer | QR code as a data URL |
| POST | `/api/attendance/scan` | attendee | body `{ qrToken, lat, lng }` — verifies + records |
| GET | `/api/attendance/:id?search=` | organizer | attendee list for an event |
| GET | `/api/attendance/:id/export` | organizer | CSV download |

## Data model

- **User** — `name, email, passwordHash, role, registrationId`
- **Event** — `title, description, venue, date, time, location{lat,lng}, geofenceRadius, organizer, qrToken`
- **Attendance** — `event, user, scannedLocation{lat,lng}, distanceFromVenue, status, timestamp`
  · unique compound index on `(event, user)`

---

## Deployment

- **Frontend** → Vercel or Netlify (framework preset: Vite). Set `VITE_API_URL` to the
  deployed backend URL + `/api`.
- **Backend** → Render or Railway. Set `MONGO_URI`, `JWT_SECRET`, `PORT`.
- Test the deployed link on a real phone — webcam and GPS behaviour differ from desktop.

## Notes

Auth uses JWT rather than OAuth. The Haversine distance helper and CSV export are covered by
standalone checks (a ~111 m point resolves to ~111.2 m; a ~1.4 km point exceeds any sane
radius). The full flow — register → login → create event → scan → geofence pass/fail →
duplicate rejected → CSV export — has been verified end to end against a live MongoDB instance.
