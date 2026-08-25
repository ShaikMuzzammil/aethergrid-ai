# AetherGrid AI — Complete Deployment & Setup Guide

> World-Scale Autonomous Edge AI Platform  
> Next.js 15 · Neon PostgreSQL · Vercel · Prisma · NextAuth

---

## Table of Contents

1. [What Is AetherGrid AI?](#1-what-is-aethergrid-ai)
2. [Project Structure](#2-project-structure)
3. [Tech Stack](#3-tech-stack)
4. [Free Services Required](#4-free-services-required)
5. [Local Development Setup](#5-local-development-setup)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Database Setup (Neon)](#7-database-setup-neon)
8. [GitHub Push](#8-github-push)
9. [Vercel Deployment](#9-vercel-deployment)
10. [Seeding Demo Data](#10-seeding-demo-data)
11. [Demo Accounts](#11-demo-accounts)
12. [API Reference](#12-api-reference)
13. [Troubleshooting](#13-troubleshooting)
14. [Platform Features](#14-platform-features)


## ⚠️ IMPORTANT: Updating an Existing GitHub Repo

If you previously pushed the old code to GitHub and are now replacing it with this fixed version, you **must delete the old `(auth)` route group folder** from your repo. Otherwise Vercel will see duplicate login/register pages and fail to build.

### Option A — Fresh repo (recommended)

```bash
# Delete the old local folder and re-extract the new ZIP
rm -rf aethergrid-ai/
unzip aethergrid-ai-FIXED.zip
mv aethergrid-fixed aethergrid-ai
cd aethergrid-ai

git init
git add .
git commit -m "fix: complete platform rewrite — all build errors resolved"
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git branch -M main
git push -u origin main --force
```

### Option B — Update existing repo

```bash
cd aethergrid-ai   # your existing repo

# Remove the old (auth) duplicate folder that caused the conflict
git rm -r --cached "src/app/(auth)" 2>/dev/null || true
rm -rf "src/app/(auth)"

# Copy in the new files from the fixed ZIP (overwrite everything)
# ... copy files ...

git add .
git commit -m "fix: remove (auth) duplicate, add autoprefixer, patch Next.js CVE"
git push
```

---

## 1. What Is AetherGrid AI?

AetherGrid AI is a production-ready, full-stack IoT + Edge AI management platform that lets you:

- **Manage edge devices** — ESP32, ESP8266, Raspberry Pi, NVIDIA Jetson, STM32, Arduino, RISC-V
- **Train & deploy AI models** — ONNX, TFLite, PyTorch, TensorFlow, OpenVINO
- **Monitor in real-time** — sensor readings, CPU/memory/temperature, live alerts
- **Automate workflows** — if/then rule engine for device events
- **Collaborate** — team management with RBAC (Owner / Admin / Member / Viewer)
- **Export data** — 30+ formats across 6 categories
- **Integrate** — 16 pre-built integrations (MQTT, AWS IoT, Grafana, Kafka, etc.)
- **Secure API access** — API key generation, webhook subscriptions

---

## 2. Project Structure

```
aethergrid-ai/
├── prisma/
│   ├── schema.prisma          # Database schema (20+ models)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (root)/
│   │   │   └── page.tsx       # Landing page
│   │   ├── login/             # Auth — sign in
│   │   ├── register/          # Auth — sign up
│   │   ├── docs/              # Documentation page
│   │   ├── dashboard/         # Main dashboard with KPIs & charts
│   │   ├── devices/           # Device fleet management
│   │   ├── ai-models/         # ML model registry & training
│   │   ├── analytics/         # Advanced analytics & charts
│   │   ├── deployments/       # Deployment management
│   │   ├── automations/       # Visual automation rule builder
│   │   ├── export/            # Data export center
│   │   ├── integrations/      # Third-party integrations
│   │   ├── settings/          # User settings, API keys, webhooks, team
│   │   └── api/               # REST API routes (18 endpoints)
│   ├── components/
│   │   ├── dashboard-layout.tsx  # Sidebar + topbar layout
│   │   └── providers.tsx         # Session + theme providers
│   ├── hooks/                 # React hooks (devices, analytics, notifications)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client singleton
│   │   └── utils.ts           # Shared utilities
│   ├── middleware.ts           # Auth middleware
│   └── types/                 # TypeScript type definitions
├── .env.example               # Environment variable template
├── GUIDE.md                   # This file
├── next.config.ts             # Next.js 15 config
├── tailwind.config.ts         # Tailwind + design tokens
└── tsconfig.json              # TypeScript config
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.3.4 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL via Neon | — |
| ORM | Prisma | 5.22.0 |
| Auth | NextAuth.js | 4.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| Animation | Framer Motion | 11.x |
| Icons | Lucide React | 0.456 |
| Forms | React Hook Form + Zod | — |
| Hosting | Vercel | — |

---

## 4. Free Services Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [neon.tech](https://neon.tech) | PostgreSQL database | 0.5 GB, unlimited projects |
| [vercel.com](https://vercel.com) | Hosting & deployment | Unlimited hobby deploys |
| [github.com](https://github.com) | Source code | Unlimited public/private repos |

All three are **100% free** — no credit card required for the free tier.

---

## 5. Local Development Setup

### Prerequisites

Make sure you have installed:
- **Node.js 18.17+** — download from [nodejs.org](https://nodejs.org)
- **npm 9+** — included with Node.js
- **Git** — download from [git-scm.com](https://git-scm.com)

### Step-by-step

#### Step 1 — Clone or extract the project

If you downloaded the ZIP:
```bash
unzip aethergrid-ai-platform.zip
cd aethergrid-ai
```

If cloning from GitHub:
```bash
git clone https://github.com/YOUR_USERNAME/aethergrid-ai.git
cd aethergrid-ai
```

#### Step 2 — Install dependencies

```bash
npm install
```

This will also run `prisma generate` automatically (via `postinstall`).

#### Step 3 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in the values (see Section 6 below).

#### Step 4 — Push database schema

```bash
npm run db:push
```

This creates all tables in your Neon database.

#### Step 5 — Seed demo data

```bash
npm run db:seed
```

This creates demo users, 8 devices, 5 AI models, notifications, and 72 sensor readings.

#### Step 6 — Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Step 7 — Log in with demo credentials

```
Email:    demo@aethergrid.ai
Password: DemoPass123!
```

---

## 6. Environment Variables Reference

Create a `.env` file (copy from `.env.example`) with these values:

### Required — Database

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

> **Both URLs are the same for Neon** — copy the connection string from Neon's dashboard.  
> Neon pooled connection = `DATABASE_URL`, direct = `DIRECT_URL`.

### Required — NextAuth

```env
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

> **On Vercel**: `NEXTAUTH_URL` is auto-injected — only set `NEXTAUTH_SECRET`.

### Optional — OAuth Providers

```env
# GitHub OAuth — https://github.com/settings/applications/new
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth — https://console.cloud.google.com/apis/credentials  
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 7. Database Setup (Neon)

### Create a free Neon project

1. Go to [neon.tech](https://neon.tech) → **Sign up** (free, no credit card)
2. Click **New Project**
3. Name it `aethergrid-ai`, region `US East` (or closest to you)
4. Click **Create Project**
5. On the dashboard, go to **Connection Details**
6. Select **Prisma** in the connection string dropdown
7. Copy the connection string — it looks like:
   ```
   postgresql://neondb_owner:abc123@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
8. Paste the same string into both `DATABASE_URL` and `DIRECT_URL` in your `.env`

### Push schema & seed

```bash
# Push schema
npm run db:push

# Seed demo data
npm run db:seed

# Optional: open Prisma Studio to inspect data
npm run db:studio
```

---

## 8. GitHub Push

### First time setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "feat: Initial AetherGrid AI platform"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git branch -M main
git push -u origin main
```

### Subsequent pushes

```bash
git add .
git commit -m "your message"
git push
```

---

## 9. Vercel Deployment

### Connect your GitHub repo to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up / Log in** with GitHub
2. Click **Add New → Project**
3. Select your `aethergrid-ai` GitHub repository
4. Click **Import**

### Configure build settings

Vercel auto-detects Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `.` (leave blank) |
| Build Command | `npm run build` |
| Output Directory | `.next` (default) |
| Install Command | `npm install` |

### Add environment variables in Vercel

In the Vercel project settings → **Environment Variables**, add:

| Key | Value | Environments |
|-----|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `DIRECT_URL` | Same Neon connection string | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Your generated secret | Production, Preview, Development |

> Do **NOT** add `NEXTAUTH_URL` on Vercel — it auto-populates `NEXTAUTH_URL` from your deployment URL.

### Deploy

Click **Deploy**. Vercel runs `npm install → prisma generate → next build`.

After successful deploy, run the seeder once from your local machine pointing to the same `DATABASE_URL`:
```bash
npm run db:seed
```

Your site is live at `https://aethergrid-ai-xxx.vercel.app` 🎉

### Custom domain (optional)

In Vercel → Domains → Add your domain → follow DNS instructions.  
Add `NEXTAUTH_URL=https://yourdomain.com` in Vercel env vars if using a custom domain.

---

## 10. Seeding Demo Data

Run from your local terminal (requires `.env` with valid `DATABASE_URL`):

```bash
npm run db:seed
```

**What gets created:**

| Resource | Count | Details |
|----------|-------|---------|
| Users | 2 | demo@aethergrid.ai + admin@aethergrid.ai |
| Device Groups | 3 | Warehouse Fleet, Production Line, Edge Compute |
| Devices | 8 | ESP32 × 3, Jetson × 2, RPi × 1, STM32 × 1, Arduino × 1 |
| AI Models | 5 | YOLO, Anomaly Sentinel, NLP, TS Forecaster, MobileNet |
| Notifications | 5 | Mixed read/unread |
| Sensor Readings | 72 | 24h of CPU, memory, temperature per 3 devices |

---

## 11. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| User | demo@aethergrid.ai | DemoPass123! |
| Admin | admin@aethergrid.ai | DemoPass123! |

You can also register a new account at `/register`.

---

## 12. API Reference

All API routes are under `/api/`. Authentication is via session cookie (NextAuth) or Bearer token.

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all devices (supports `?status=`, `?type=`, `?page=`) |
| POST | `/api/devices` | Create a new device |
| GET | `/api/devices/:id` | Get device with sensor readings, alerts, commands |
| PATCH | `/api/devices/:id` | Update device fields |
| DELETE | `/api/devices/:id` | Delete device |
| GET | `/api/devices/:id/readings` | Get sensor readings (`?metric=`, `?hours=24`) |
| POST | `/api/devices/:id/readings` | Push sensor readings (batch) |
| GET | `/api/devices/:id/commands` | List commands sent to device |
| POST | `/api/devices/:id/commands` | Send command to device |

### AI Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai-models` | List all models |
| POST | `/api/ai-models` | Create model |
| GET | `/api/ai-models/:id` | Get model with training jobs |
| PATCH | `/api/ai-models/:id` | Update model |
| DELETE | `/api/ai-models/:id` | Delete model |
| POST | `/api/ai-models/:id/train` | Start training job |

### Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Create deployment |
| GET | `/api/deployments/:id` | Get deployment with logs & metrics |
| PATCH | `/api/deployments/:id` | Update deployment |
| DELETE | `/api/deployments/:id` | Delete deployment |

### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET/PATCH /api/users/profile` | User profile |
| `GET/POST /api/api-keys` | API key management |
| `DELETE /api/api-keys/:id` | Revoke API key |
| `GET/POST /api/webhooks` | Webhook management |
| `PATCH/DELETE /api/webhooks/:id` | Update/delete webhook |
| `GET /api/analytics` | Dashboard analytics overview |
| `GET/POST /api/export` | Export jobs |
| `GET/POST /api/notifications` | Notifications |
| `PATCH /api/notifications` | Mark read |
| `GET/POST /api/team` | Team management |

---

## 13. Troubleshooting

### Build error: `Prisma schema validation — P1012`

**Cause**: Enum definitions on a single line (old format).  
**Fix**: This version has the schema fixed. If you see it, replace single-line enums like:
```
enum UserRole { USER ADMIN }
```
with multi-line format:
```
enum UserRole {
  USER
  ADMIN
}
```

### Build error: `serverComponentsExternalPackages is not a valid config`

**Cause**: Old `next.config.ts` using Next.js 14 API.  
**Fix**: In `next.config.ts`, use `serverExternalPackages` instead (Next.js 15).

### `params should be awaited` warning/error

**Cause**: Next.js 15 requires params to be async in route handlers.  
**Fix**: Change `{ params }: { params: { id: string } }` to `{ params }: { params: Promise<{ id: string }> }` and add `const { id } = await params;`.

### `NEXTAUTH_SECRET is not set`

**Fix**: Generate a secret and add it:
```bash
openssl rand -base64 32
```
Paste into `.env` as `NEXTAUTH_SECRET="..."`.

### Database connection errors

1. Check that `DATABASE_URL` in `.env` matches exactly what Neon shows
2. Ensure `?sslmode=require` is at the end of the URL
3. Run `npm run db:push` to recreate tables if schema changed

### `Module not found: @prisma/client`

**Fix**: Run `npm run db:generate` or `npx prisma generate`.

### Seed fails with unique constraint

The seeder uses `upsert` for most records. If you see constraint errors:
```bash
# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
npm run db:seed
```

### Build succeeds but pages show 500

1. Check Vercel → Functions → Logs for the error
2. Ensure all env vars are set in Vercel (especially `DATABASE_URL` and `NEXTAUTH_SECRET`)
3. Prisma generate runs automatically via `postinstall` — if it fails, add `prisma generate` to the Vercel build command: `npm run db:generate && next build`

---

## 14. Platform Features

### Dashboard (`/dashboard`)
- 6 KPI cards: Devices, Online Rate, AI Models, Deployments, Alerts, API Calls
- 4 chart types: line (device activity), area (inference load), bar (model accuracy), polar (device distribution)
- Live alert feed
- Recent activity stream

### Devices (`/devices`)
- Grid / list view toggle
- Filter by status (Online/Offline/Warning/Error) and type
- Add device modal with full form
- Detail side panel: sensor readings, commands, alerts
- OTA firmware command

### AI Models (`/ai-models`)
- Model registry with upload wizard
- Training job launcher with hyperparameter config
- Accuracy / loss charts (simulated)
- Inference playground
- One-click deploy

### Analytics (`/analytics`)
- Radar chart (performance dimensions)
- Heatmap (device activity by hour/day)
- Area chart (network throughput)
- Latency distribution histogram
- Geographic device table
- Date range picker

### Deployments (`/deployments`)
- Accordion deployment rows with status badges
- Live log stream panel
- Resource usage charts (CPU/memory)
- Create deployment wizard

### Automations (`/automations`)
- Visual if/then/action rule builder
- Trigger: device status change, threshold, schedule
- Actions: send command, notify, call webhook
- Enable/disable toggles

### Export Center (`/export`)
- 30+ formats: CSV, JSON, Parquet, XLSX, PDF, MQTT, InfluxDB, Prometheus, etc.
- Progress animation during export
- Download history

### Integrations (`/integrations`)
- 16 integrations: AWS IoT, Azure IoT, Google Cloud IoT, Grafana, Prometheus, Kafka, MQTT, InfluxDB, Datadog, Splunk, Slack, PagerDuty, Twilio, Webhooks, REST API, MQTT Broker
- Connect/disconnect with status indicators

### Settings (`/settings`)
- Profile: name, avatar, email display
- Security: password change, 2FA toggle
- Notifications: email/push/SMS preferences
- Appearance: theme toggle, density, accent color
- API Keys: generate, revoke, permission scopes
- Webhooks: create, test, event subscriptions
- Team: invite members, RBAC role selector

---

## Quick Commands Reference

```bash
npm run dev           # Start local dev server
npm run build         # Production build (prisma generate + next build)
npm run start         # Start production server
npm run lint          # Lint code
npm run type-check    # TypeScript check without building

npm run db:push       # Push schema to database
npm run db:generate   # Regenerate Prisma client
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio (DB GUI) at localhost:5555
npm run db:migrate    # Run pending Prisma migrations
```

---

*Built with ❤️ — AetherGrid AI Platform v1.0.0*
