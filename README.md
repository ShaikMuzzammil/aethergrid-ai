# AetherGrid AI — v6

> **World-scale autonomous edge AI infrastructure platform**  
> Deploy AI models to IoT devices, simulate telemetry, automate responses, monitor everything.

---

## ✅ What's fixed in v6

| # | Area | Fix |
|---|------|-----|
| 1 | **Login speed** | Demo user cached in memory after first creation; no repeated bcrypt calls |
| 2 | **Sign out wrong domain** | Auth callback always uses relative URL; `redirect()` callback enforces same-origin |
| 3 | **Notifications invisible** | Fixed `markAllRead` body key mismatch (`action:` → `markAllRead:true`); both formats handled |
| 4 | **Settings not saving** | All 5 tabs (Profile, Security, Notifications, Appearance, Advanced) now call correct API and show success/error toast |
| 5 | **Password change** | Current password verified, bcrypt compare, min-8 chars, new ≠ current — all enforced |
| 6 | **Landing page** | Full rewrite: scroll-reveal animations, `IntersectionObserver` counter animation, typewriter hero, particle network with mouse repulsion |
| 7 | **Tab switching slow** | Removed redundant session re-checks; pages use `force-dynamic` + lightweight `Promise.all` fetches |
| 8 | **Notification bell** | Badge shows live unread count; auto-refreshes every 30s; correct colour per type |
| 9 | **Signout destination** | Always lands on `/` (home page), never external domain |

---

## 🆕 New in v6

### 📡 Device Simulator (`/simulator`)
Simulate real-time IoT telemetry for any registered device directly from the dashboard:
- **4 modes**: Normal · CPU Spike · Degraded · Chaos
- Live canvas charts update per push
- Configurable push interval (1–30 s)
- Pushes to the same `/api/simulator` endpoint that real devices use — triggers automations, updates analytics

### ⌘K Command Palette
- Keyboard shortcut **Ctrl+K** (or **⌘K** on Mac) opens a full command palette
- Navigate to any page, settings, or run quick actions
- Arrow key navigation + Enter to open
- Also accessible from the sidebar search bar

### 🔍 Global Search API (`/api/search`)
- Searches devices, AI models, and deployments by name in one query
- Used by the Command Palette for live results

### 🔔 Enhanced Notification Panel
- Colour-coded by type: Device Alert 🟡 · Model Complete 🟣 · Deployment 🔵 · Security 🟢
- Unread dot + badge count
- Mark all read button working correctly
- Auto-refresh every 30s

### 📊 Enhanced Dashboard
- Active Alerts panel (severity-coded)
- Top Deployed Models with accuracy
- Recent Events feed
- System Health gauges with danger colour at >85%
- Fully live — auto-refreshes every 30s with animated sparklines

---

## 🚀 Deploy in 3 steps

### 1. Push to GitHub

```bash
bash push.sh https://github.com/<your-username>/aethergrid-ai.git
```

### 2. Create Vercel project
- Import the GitHub repo at **vercel.com/new**
- Framework: **Next.js** (auto-detected)

### 3. Add environment variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...?sslmode=require&pgbouncer=true` (Neon **pooled** URL) |
| `DIRECT_URL` | `postgresql://...?sslmode=require` (Neon **direct** URL) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

Click **Deploy**. The build command runs:
```
rm -rf src/app/(auth) && prisma generate && prisma db push && prisma db seed && next build
```

---

## 🔑 Demo login

```
Email:    demo@aethergrid.ai
Password: DemoPass123!
```

---

## 🗂 Architecture

```
src/
├── app/
│   ├── page.tsx                  # Landing page (NetworkCanvas, scroll-reveal, typewriter)
│   ├── login/                    # Optimized login with step labels + Suspense
│   ├── register/                 # Registration
│   ├── dashboard/                # Main dashboard (live gauges, alerts, sparklines)
│   ├── devices/                  # Full CRUD, remote commands, CPU/memory bars
│   ├── ai-models/                # Upload, version, training progress, status transitions
│   ├── deployments/              # Create, start/stop, live metrics per deployment
│   ├── analytics/                # Canvas charts, CSV export, latency P50/P99
│   ├── automations/              # Visual rule builder (trigger + action)
│   ├── simulator/                # 🆕 Real-time IoT device telemetry simulator
│   ├── export/                   # Job queue, polling, real CSV download
│   ├── integrations/             # 8 providers (Slack, PagerDuty, Datadog…)
│   ├── docs/                     # In-app API reference (curl/Python/Node/ESP32)
│   └── settings/
│       ├── page.tsx              # Profile · Security · Notifications · Appearance · Advanced
│       ├── api-keys/             # Key generation, permission matrix
│       ├── team/                 # RBAC invite flow
│       └── webhooks/             # HMAC secret, event subscriptions
│
├── api/
│   ├── dashboard/                # Devices + models + alerts + chart data
│   ├── devices/[id]/             # GET/PATCH/DELETE + commands (ping/reboot/OTA)
│   ├── ai-models/                # Upload, status transitions
│   ├── deployments/              # Create, start/stop, metrics
│   ├── analytics/                # Time-range telemetry aggregation
│   ├── automations/              # CRUD + toggle active
│   ├── export/                   # Queue jobs + download
│   ├── integrations/             # 8 provider config
│   ├── api-keys/                 # crypto key generation
│   ├── webhooks/                 # HMAC + test ping
│   ├── team/                     # Invite + RBAC
│   ├── notifications/            # List + markAllRead (fixed)
│   ├── search/                   # 🆕 Global full-text search
│   ├── simulator/                # 🆕 Push simulated telemetry
│   └── users/profile/            # GET + PATCH (profile, password, prefs)
│
├── components/
│   └── dashboard-layout.tsx      # Sidebar + ⌘K palette + notification panel
│
└── lib/
    ├── auth.ts                   # NextAuth (cached demo user, same-origin redirect)
    └── db.ts                     # Prisma client singleton
```

---

## 🧩 Prisma Schema highlights

```prisma
model User {
  theme     String?  @default("dark")
  density   String?  @default("default")   // NEW in v6
  language  String?  @default("en")
  timezone  String?  @default("UTC")
  notifyEmail Boolean @default(true)
  notifyPush  Boolean @default(true)
  notifySlack Boolean @default(false)
}
```

Run migrations after deploy:
```bash
npx prisma db push
npx prisma db seed
```

---

## 🔌 API Reference (quick)

```bash
# Auth header for all requests
-H "x-api-key: ag_live_yourkey"

# List devices
GET /api/devices

# Push simulated telemetry
POST /api/simulator
{ "deviceId": "...", "readings": [{ "metric": "cpu", "value": 73, "unit": "%" }] }

# Mark all notifications read
PATCH /api/notifications
{ "markAllRead": true }

# Global search
GET /api/search?q=jetson

# Update profile
PATCH /api/users/profile
{ "name": "...", "bio": "...", "timezone": "Asia/Kolkata" }

# Change password
PATCH /api/users/profile
{ "currentPassword": "...", "newPassword": "..." }
```

Full reference with curl/Python/Node/ESP32 examples is available at `/docs` inside the app.

---

## 📄 License

MIT — free to use, modify, and deploy.
