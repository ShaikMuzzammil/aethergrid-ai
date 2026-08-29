# AetherGrid AI — World-Scale Edge AI Platform

> Deploy AI models from **$3 ESP32 microcontrollers** to **NVIDIA GPU clusters**. Manage millions of IoT devices, stream real-time telemetry, automate your entire edge fleet — one unified platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShaikMuzzammil/aethergrid-ai)

**Live demo:** `demo@aethergrid.ai` / `DemoPass123!`

---

## Quick Deploy (3 steps)

```bash
# 1. Push to GitHub
bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git

# 2. Import repo on vercel.com/new
# 3. Add 4 env vars → Deploy
```

See **[DEPLOY.md](./DEPLOY.md)** for the complete guide with screenshots and troubleshooting.

### Required environment variables

| Variable | How to get |
|----------|-----------|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → Pooled connection string |
| `DIRECT_URL` | [neon.tech](https://neon.tech) → Direct connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL |

---

## Features

| Module | What it does |
|--------|-------------|
| **Dashboard** | Live fleet overview — sparklines, radial gauges, device map |
| **Devices** | Manage ESP32, Jetson, RPi, STM32, Arduino, RISC-V fleets |
| **AI Models** | Upload, train, version and deploy ML models |
| **Deployments** | K8s-style orchestration — replicas, CPU/mem limits, rollback |
| **Analytics** | 4-tab deep analytics — radar, heatmap, scatter, distribution charts |
| **Automations** | Rule-based automation engine — triggers, conditions, actions |
| **Export** | CSV, JSON, Parquet, Avro, SQL, BigQuery exports |
| **Integrations** | AWS IoT, Azure IoT Hub, Slack, Grafana, Kafka and 15+ more |
| **API Keys** | Create, scope, revoke and audit API credentials |
| **Webhooks** | Event-driven webhooks with full delivery history |
| **Team** | Multi-member workspaces with Owner / Admin / Member roles |
| **Settings** | Profile, security, notifications, appearance, billing |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 — App Router, Server Components, Route Handlers |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma 5 + Neon (serverless) |
| Auth | NextAuth.js v4 — JWT sessions + Credentials provider |
| Styling | Tailwind CSS 3 + custom CSS variables |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | Sonner |
| Fonts | Space Grotesk (display) + JetBrains Mono (code) |
| Deploy | Vercel Edge Network |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page — 15 sections, real-time canvas
│   ├── login/page.tsx              # Auth — login + demo button
│   ├── register/page.tsx           # Auth — registration
│   ├── dashboard/                  # Main dashboard
│   ├── devices/                    # Device fleet management
│   ├── ai-models/                  # ML model hub
│   ├── analytics/                  # Deep analytics (4 tabs)
│   ├── deployments/                # Deployment orchestrator
│   ├── automations/                # Workflow automation
│   ├── export/                     # Data export centre
│   ├── integrations/               # Third-party integrations
│   ├── settings/                   # Profile + API keys + team + webhooks
│   ├── docs/                       # Documentation page
│   ├── legal/                      # Terms + Privacy pages
│   └── api/                        # REST API route handlers
├── components/
│   ├── dashboard-layout.tsx        # Sidebar + topbar layout (named + default export)
│   └── providers.tsx               # SessionProvider + ThemeProvider
├── lib/
│   ├── auth.ts                     # NextAuth config + demo user auto-creation
│   ├── db.ts                       # Prisma client singleton
│   └── utils.ts                    # Shared utilities
├── hooks/                          # useDevices, useAnalytics, useNotifications
├── types/                          # TypeScript types + NextAuth module augmentation
└── middleware.ts                   # Route protection — redirects unauthenticated users
```

---

## Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET
# Set NEXTAUTH_URL=http://localhost:3000

# Push Prisma schema to database
npx prisma db push

# Seed demo data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Useful scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (visual DB editor)
npm run type-check   # Run TypeScript compiler check
```

---

## How the build works

The `vercel.json` build command:

```
prisma generate && prisma db push && next build
```

1. **`prisma generate`** — generates TypeScript Prisma client from schema
2. **`prisma db push`** — creates/updates all database tables in Neon (safe — never drops data)
3. **`next build`** — compiles the Next.js production bundle

No manual migrations. Every deploy keeps the DB in sync automatically.

---

## Authentication

The app uses NextAuth.js with a **Credentials** provider (email + password).

- Passwords are hashed with **bcrypt** (12 rounds for production, 10 for demo)
- Sessions use **JWT** strategy (stateless — no database session table needed)
- All dashboard routes are protected by **middleware** — unauthenticated users are redirected to `/login`
- The demo user (`demo@aethergrid.ai`) is **auto-created** on first demo login — no seed required

---

## Changelog

### v4 (current)
- ✅ **Root fix:** `prisma db push` added to Vercel build — tables auto-created on every deploy
- ✅ Register + login: precise inline error messages (distinguish DB error vs wrong password vs email taken)
- ✅ Demo login: auto-registers demo user on first attempt, retries sign-in
- ✅ Landing page: completely rebuilt NetworkCanvas — 42 animated nodes, glowing connections, packet trails, mouse repulsion, live stats overlay
- ✅ Auth pages: inline error display (not just toasts), clearer demo credentials hint
- ✅ TypeScript: `Activity` import fix in analytics-client, `DashboardClient` user prop fix, `next-auth.d.ts` type fix
- ✅ API routes: `_req` vs `req` parameter fixed in 5 POST handlers

### v3
- Full 15-section landing page with Space Grotesk + JetBrains Mono fonts
- Home button on all auth pages, dashboard sidebar, profile dropdown
- 12 dashboard modules all wired to API routes

---

Built by [Shaik Muzzammil](https://linktr.ee/Shaik_Muzzammil) · [Portfolio](https://shaik-muzzammil-portfolio.vercel.app) · [Linktree](https://linktr.ee/Shaik_Muzzammil)
