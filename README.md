<div align="center">

# GATE — Geo Attendance Tracking Engine

**QR-based, geo-verified attendance for events and classes.**
Scan the event QR, the browser captures your live GPS fix, and attendance is recorded **only if you're physically inside the venue's geofence.** One check-in per person, enforced at the database level.

### [▶ Live demo](https://gate-geo-attendance-tracking-engine.vercel.app)

<sub>Frontend on Vercel · API on Render (free tier — first request after idle can take ~50s to wake)</sub>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)

[Features](#features) · [Screenshots](#screenshots) · [Tech stack](#tech-stack) · [How it works](#how-it-works) · [Getting started](#getting-started) · [API reference](#api-reference) · [Deployment](#deployment)

</div>

![Landing page](docs/screenshots/landing.png)

---

## 🧭 Overview

GATE is a full-stack MERN application that makes proxy attendance impossible. An **organizer**
creates an event with a map location and a geofence radius; the server mints a unique QR code
for it. An **attendee** scans that QR from their phone, the browser reads their GPS position,
and the server records attendance only when the Haversine distance to the venue is inside the
radius. A unique compound index on `(event, user)` guarantees one check-in per person.

Organizers get a dashboard with per-event stats, live search, and one-click CSV export.

---

<a name="features"></a>
## ✨ Features

| | |
|---|---|
| **Role-based auth** | JWT register / login with `organizer` and `attendee` roles |
| **Event management** | Create, edit, delete events — venue, date/time, map location, geofence radius (default 150 m) |
| **Unique QR per event** | Auto-generated token per event, served as a data URL, shown on a scannable white card |
| **Camera scanning** | In-browser QR scanning with `html5-qrcode` |
| **Geofence verification** | Haversine distance check against the venue; out-of-range scans are rejected with the exact distance |
| **No duplicate check-ins** | Enforced by a unique DB index on `(event, user)` |
| **Interactive venue map** | Leaflet map on the event form — click or drag to drop the pin; the geofence circle scales with the radius |
| **Organizer dashboard** | Attendee list, live search, per-event stats, CSV export with all required columns |
| **Dark UI** | Hand-built design system — pure-black theme, Archivo / Space Grotesk / Inter, CSS-only animation, animated grid background |

---

<a name="screenshots"></a>
## 📸 Screenshots

| Landing | How it works |
|---|---|
| ![Landing](docs/screenshots/landing.png) | ![How it works](docs/screenshots/how-it-works.png) |

| Login | Register |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Register](docs/screenshots/register.png) |

| Organizer dashboard | Create / edit event (map + geofence) |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Create event](docs/screenshots/create-event.png) |

**Event attendance — QR, live stats, roster, CSV export**

![Attendance](docs/screenshots/attendance.png)

---

<a name="tech-stack"></a>
## 🛠️ Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | React 18 + Vite, React Router, Axios, `html5-qrcode`, Leaflet (keyless OpenStreetMap tiles) |
| **Backend** | Node + Express, Mongoose, `jsonwebtoken`, `bcryptjs`, `qrcode` |
| **Database** | MongoDB (Atlas or local) |
| **Styling** | Single hand-written CSS design system — no UI framework |

---

<a name="how-it-works"></a>
## ⚙️ How it works

1. An **organizer** registers, logs in, and creates an event with venue, date/time, GPS
   coordinates (drop the pin on the map or use "Use my location"), and a geofence radius.
   The backend generates a unique QR token for the event.
2. An **attendee** registers, logs in, opens the event, and scans its QR with their camera.
   The browser also reads their current GPS position.
3. The backend resolves the scanned token to an event, computes the **Haversine distance**
   between the attendee and the venue, and records attendance **only if it's within the
   radius**. A unique compound index on `(event, user)` blocks duplicate check-ins.
4. Organizers search / filter the attendee list and export it to CSV.

> **Note:** camera and geolocation require HTTPS in the browser — except on `localhost`,
> which is exempt. Local dev works as-is; any deployment must be served over HTTPS.

---

<a name="getting-started"></a>
## 🚀 Getting started

### ✅ Prerequisites

- **Node.js 18+**
- A **MongoDB connection string** — a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  M0 cluster works. Create a DB user, and under **Network Access** allow `0.0.0.0/0` for a
  dev project.

### 🖥️ 1 · Backend

```bash
cd backend
cp .env.example .env      # paste MONGO_URI, set a long random JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

| `.env` key | Example |
|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/attendance-app` |
| `JWT_SECRET` | any long random string |
| `PORT` | `5000` |

### 💻 2 · Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api is correct for local dev
npm install
npm run dev               # http://localhost:5173
```

### 🧪 3 · Try it

Open http://localhost:5173 and register two accounts (use a second browser profile or an
incognito window for the attendee):

1. **Organizer** — create an event; drop the pin on the map or use "Use my location" so the
   geofence check can pass. Open **Manage / QR / Attendance** to display the QR.
2. **Attendee** — open the event, hit **Scan to Mark Attendance**, scan the QR, and allow
   camera + location access.

---

## 🗂️ Project structure

```
backend/
  src/
    controllers/   auth, event, attendance
    models/        User, Event, Attendance
    routes/        route definitions
    middleware/    auth guard, error handler
    utils/         geo (Haversine), qr, csv
frontend/
  src/
    pages/         Landing, Login, Register, dashboards, ScanPage
    components/     Navbar, PrivateRoute, GeoMap, Reveal
    context/        AuthContext
    api/            axios instance
    styles.css      single design system
```

---

<a name="api-reference"></a>
## 🔌 API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | create account (`role`: `organizer` or `attendee`) |
| `POST` | `/api/auth/login` | — | returns JWT |
| `GET` | `/api/auth/me` | ✔ | current user |
| `GET` | `/api/events?search=` | ✔ | list events (organizer sees only their own) |
| `POST` | `/api/events` | organizer | create event (auto-generates QR token) |
| `GET` | `/api/events/:id` | ✔ | event detail |
| `PUT` | `/api/events/:id` | organizer | edit event |
| `DELETE` | `/api/events/:id` | organizer | delete event |
| `GET` | `/api/events/:id/qrcode` | organizer | QR code as a data URL |
| `POST` | `/api/attendance/scan` | attendee | body `{ qrToken, lat, lng }` — verifies + records |
| `GET` | `/api/attendance/:id?search=` | organizer | attendee list for an event |
| `GET` | `/api/attendance/:id/export` | organizer | CSV download |

### 🗃️ Data model

- **User** — `name, email, passwordHash, role, registrationId`
- **Event** — `title, description, venue, date, time, location{lat,lng}, geofenceRadius, organizer, qrToken`
- **Attendance** — `event, user, scannedLocation{lat,lng}, distanceFromVenue, status, timestamp`
  · unique compound index on `(event, user)`

---

<a name="deployment"></a>
## ☁️ Deployment

| Part | Where | Env vars |
|---|---|---|
| Frontend | Vercel / Netlify (preset: Vite) | `VITE_API_URL` = deployed backend URL + `/api` |
| Backend | Render / Railway | `MONGO_URI`, `JWT_SECRET`, `PORT` |

Test the deployed link on a real phone — webcam and GPS behaviour differ from desktop.

---

## 📝 Notes

Auth uses JWT rather than OAuth. The Haversine helper and CSV export are covered by standalone
checks (a ~111 m point resolves to ~111.2 m; a ~1.4 km point exceeds any sane radius). The full
flow — register → login → create event → scan → geofence pass/fail → duplicate rejected → CSV
export — has been verified end to end against a live MongoDB instance.

---

## 👨‍💻 Author

**Krishiv Sharma**

B.Tech CSE — Cybersecurity

Interested in:

**Cybersecurity • Software Engineering • AI • Threat Detection**

---

<div align="center">

Built with a focus on **full-stack engineering • geolocation • secure auth**

⭐ If you found GATE interesting, consider starring the repository.

</div>
