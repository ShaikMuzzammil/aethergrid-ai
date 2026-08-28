# AetherGrid AI — Edge AI Platform

> Deploy, monitor, and scale AI models from $3 ESP32 microcontrollers to NVIDIA GPU clusters. The world's most capable edge AI platform.

**Live Demo:** `demo@aethergrid.ai` / `DemoPass123!`

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Live sparklines, radial gauges, fleet overview |
| **Devices** | Manage ESP32, RPi, Jetson, STM32, Arduino, RISC-V |
| **AI Models** | Upload, train, version, deploy ML models |
| **Deployments** | K8s-style scaling — replicas, CPU/mem limits |
| **Analytics** | 4-tab deep analytics — radar charts, heatmaps, distributions |
| **Automations** | Rule-based automation engine (triggers → actions) |
| **Export Center** | CSV, JSON, Parquet, Avro, SQL, BigQuery exports |
| **Integrations** | AWS IoT, Azure, Slack, Grafana, Kafka, 15+ more |
| **API Keys** | Create, revoke, manage API credentials |
| **Webhooks** | Event-driven webhooks with delivery logs |
| **Team** | Multi-member teams with role management |
| **Settings** | Profile, security, notifications, appearance |

## Quick Deploy

```bash
# 1. Clone or extract
cd aethergrid-ai

# 2. Push to your GitHub repo
bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git

# 3. Set Vercel env vars:
#    DATABASE_URL  — Neon pooled connection string
#    DIRECT_URL    — Neon direct connection string
#    NEXTAUTH_SECRET — openssl rand -base64 32
#    NEXTAUTH_URL  — https://your-app.vercel.app
```

See [DEPLOY.md](./DEPLOY.md) for the full guide.

## Local Development

```bash
# Install dependencies
npm install

# Set up .env.local (copy from .env.example)
cp .env.example .env.local
# Edit .env.local with your Neon credentials

# Push schema to database
npm run db:push

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15.5** — App Router, Server Components, Route Handlers
- **TypeScript 5** — Full type safety
- **Prisma 5** + **Neon PostgreSQL** — ORM + serverless DB
- **NextAuth.js 4** — JWT auth with credentials provider
- **Tailwind CSS 3** — Utility-first styling
- **Framer Motion** — Page and component animations
- **Recharts** — Area, bar, pie, radar, scatter charts
- **Lucide React** — Icon system
- **Sonner** — Toast notifications
- **Space Grotesk + JetBrains Mono** — Typography

## Project Structure

```
src/
├── app/
│   ├── page.tsx               # Landing page (15 sections)
│   ├── login/page.tsx         # Auth — login with demo button
│   ├── register/page.tsx      # Auth — registration
│   ├── dashboard/             # Main dashboard
│   ├── devices/               # Device fleet management
│   ├── ai-models/             # ML model hub
│   ├── analytics/             # Deep analytics (4 tabs)
│   ├── deployments/           # Deployment manager
│   ├── automations/           # Workflow automation
│   ├── export/                # Data export center
│   ├── integrations/          # Third-party integrations
│   ├── settings/              # Profile, security, team, webhooks, API keys
│   ├── docs/                  # Documentation page
│   └── api/                   # REST API routes
├── components/
│   ├── dashboard-layout.tsx   # Sidebar + topbar layout
│   └── providers.tsx          # SessionProvider + ThemeProvider
├── lib/
│   ├── auth.ts                # NextAuth config + demo user creation
│   ├── db.ts                  # Prisma client singleton
│   └── utils.ts               # Utilities
├── hooks/                     # useDevices, useAnalytics, useNotifications
├── types/                     # TypeScript types + NextAuth augmentation
└── middleware.ts              # Auth route protection
```

---

Built by [Shaik Muzzammil](https://linktr.ee/Shaik_Muzzammil) · [Portfolio](https://shaik-muzzammil-portfolio.vercel.app)
