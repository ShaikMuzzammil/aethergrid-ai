# AetherGrid AI — v5

> **World-scale autonomous edge AI and hardware OS ecosystem platform**  
> Manage IoT devices, deploy AI models, automate your fleet, and monitor everything — in one platform.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-teal)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-green)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)

---

## What's Inside

| Module | Features |
|---|---|
| **Dashboard** | Real-time fleet overview, system gauges, telemetry charts, live events feed |
| **Devices** | Register/manage 12+ device types, remote commands, telemetry, alerts |
| **AI Models** | Upload models (TF/PyTorch/ONNX/TFLite), training status, one-click deploy |
| **Deployments** | Multi-region deployments, replica scaling, live CPU/memory/req metrics |
| **Analytics** | Time-ranged charts (1H→30D), latency P50/P99, top devices, model performance |
| **Automations** | Visual rule builder: threshold/schedule/offline triggers → notify/scale/OTA actions |
| **Export** | Queue CSV/JSON/XLSX exports, background processing, download completed files |
| **Integrations** | Slack, GitHub, PagerDuty, Datadog, MQTT, AWS IoT, Grafana, Jira |
| **API Keys** | Scoped key generation (live/test), permission matrix, revocation |
| **Webhooks** | HMAC-SHA256 signed events, 10 event types, delivery log |
| **Team** | OWNER/ADMIN/MEMBER/VIEWER RBAC, invite flow, role management |
| **Settings** | Profile, password change, notification prefs, appearance, danger zone |
| **Docs** | In-app API reference with copy-able code examples (curl, Python, Node, ESP32) |

---

## Tech Stack

- **Framework**: Next.js 15 App Router (TypeScript)
- **Auth**: NextAuth.js v4 (credentials + JWT)
- **ORM**: Prisma with PostgreSQL (Neon serverless)
- **Styling**: Tailwind CSS + custom CSS variables
- **UI**: Lucide React icons, Sonner toasts
- **Deploy**: Vercel (auto-deploy on push)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/ShaikMuzzammil/aethergrid-ai.git
cd aethergrid-ai
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```env
# Neon PostgreSQL — get from neon.tech (free tier)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize database and seed

```bash
npm run db:push     # Push Prisma schema to Neon
npm run db:seed     # Seed demo data (devices, models, etc.)
npm run dev         # Start development server
```

### 4. Login

Open [http://localhost:3000](http://localhost:3000)  
Demo credentials: **demo@aethergrid.ai** / **DemoPass123!**

---

## API Reference (quick)

```bash
BASE_URL=https://your-project.vercel.app
API_KEY=ag_live_xxx

# List devices
curl $BASE_URL/api/devices -H "Authorization: Bearer $API_KEY"

# Register device
curl -X POST $BASE_URL/api/devices \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"name":"ESP32-01","type":"ESP32","location":"Warehouse A"}'

# Send command
curl -X POST $BASE_URL/api/devices/{id}/commands \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"command":"reboot"}'
```

Full interactive docs available at `/docs` in the app.

---

## Deploy to Vercel

See [DEPLOY.md](./DEPLOY.md) for the full step-by-step guide.

**TL;DR:**

```bash
bash push.sh https://github.com/YourUser/aethergrid-ai.git
```

Then add 4 env vars in Vercel dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── api/                    # All API routes
│   │   ├── dashboard/          # Aggregated dashboard stats
│   │   ├── devices/            # Device CRUD + commands
│   │   ├── ai-models/          # Model lifecycle management
│   │   ├── deployments/        # Deployment management
│   │   ├── analytics/          # Telemetry queries
│   │   ├── automations/        # Automation rules CRUD
│   │   ├── integrations/       # 8-provider integration manager
│   │   ├── export/             # Background export jobs
│   │   ├── api-keys/           # Scoped key generation
│   │   ├── webhooks/           # Webhook management
│   │   ├── team/               # Team RBAC
│   │   └── users/profile/      # Profile + password update
│   ├── dashboard/              # Dashboard page
│   ├── devices/                # Device fleet page
│   ├── ai-models/              # AI Model Hub page
│   ├── deployments/            # Deployments page
│   ├── analytics/              # Analytics page
│   ├── automations/            # Automation rule builder
│   ├── integrations/           # Integration marketplace
│   ├── export/                 # Data export page
│   ├── settings/               # Settings (profile/security/team/keys/webhooks)
│   └── docs/                   # In-app API documentation
├── lib/
│   ├── auth.ts                 # NextAuth config + demo user
│   └── db.ts                   # Prisma client singleton
└── types/
    └── next-auth.d.ts
prisma/
├── schema.prisma               # Full schema (18 models, 12 enums)
└── seed.ts                     # Rich seed data (12 devices, 6 models, etc.)
```

---

Built by **Nova** (Shaik Muzzammil) · [Portfolio](https://shaik-muzzammil-portfolio.vercel.app) · [Linktree](https://linktr.ee/Shaik_Muzzammil)
