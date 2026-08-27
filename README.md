<div align="center">

# ⚡ AetherGrid AI
### World-Scale Edge AI Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=nextdotjs)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Neon](https://img.shields.io/badge/DB-Neon-00E5B4?logo=postgresql)](https://neon.tech)

**Deploy AI to any device. Manage billions of IoT endpoints. Real-time analytics at the edge.**

[Live Demo →](https://aethergrid-ai.vercel.app) · [Docs →](https://aethergrid-ai.vercel.app/docs) · [Register Free →](https://aethergrid-ai.vercel.app/register)

</div>

---

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- [Neon PostgreSQL](https://neon.tech) free account (for DB)
- [Vercel](https://vercel.com) free account (for hosting)
- [GitHub](https://github.com) account

---

## 📁 Project Structure

```
aethergrid-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Landing page (full redesign)
│   │   ├── layout.tsx            ← Root layout + fonts
│   │   ├── globals.css           ← Global styles + animations
│   │   ├── dashboard/            ← Main control centre
│   │   ├── devices/              ← IoT device management
│   │   ├── ai-models/            ← ML model registry
│   │   ├── deployments/          ← Deployment manager
│   │   ├── analytics/            ← Real-time analytics
│   │   ├── automations/          ← Rule engine & webhooks
│   │   ├── export/               ← Data export (CSV/JSON/PDF)
│   │   ├── integrations/         ← Third-party integrations
│   │   ├── settings/             ← User/team/API settings
│   │   ├── login/                ← Auth (with home button)
│   │   ├── register/             ← Signup (with home button)
│   │   ├── docs/                 ← Documentation page
│   │   ├── legal/                ← Terms + Privacy pages
│   │   └── api/                  ← All API routes (REST)
│   ├── components/
│   │   ├── dashboard-layout.tsx  ← Sidebar + header
│   │   └── providers.tsx         ← Session + toast providers
│   ├── hooks/                    ← SWR data hooks
│   ├── lib/
│   │   ├── auth.ts               ← NextAuth config (auto-demo)
│   │   ├── db.ts                 ← Prisma singleton
│   │   └── utils.ts              ← Utility functions
│   ├── middleware.ts              ← Route protection
│   └── types/                    ← TypeScript declarations
├── prisma/
│   ├── schema.prisma             ← Full DB schema (25+ models)
│   └── seed.ts                   ← Demo data seeder
├── .env.example                  ← All required env vars
├── vercel.json                   ← Vercel deployment config
└── GUIDE.md                      ← Full deployment walkthrough
```

---

## 🗄️ Environment Variables

Copy `.env.example` to `.env` and fill in these values:

```bash
# ── Required ─────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# ── Auto-set by Vercel in production ─────────────────────────
NEXTAUTH_URL="http://localhost:3000"  # local only

# ── Optional OAuth ────────────────────────────────────────────
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Where to get each value

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon → Project → Connection String (pooled) |
| `DIRECT_URL` | Neon → Project → Connection String (direct) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL (auto-set in prod) |

---

## 🖥️ Local Development

```bash
# 1. Clone
git clone https://github.com/ShaikMuzzammil/aethergrid-ai.git
cd aethergrid-ai

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env with your Neon DB + NextAuth secret

# 4. Push schema to DB
npm run db:push

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
# Open http://localhost:3000
```

---

## 🌐 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
cd aethergrid-ai
git init
git add .
git commit -m "feat: initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git branch -M main
git push -u origin main --force
```

### Step 2 — Create Neon Database

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Choose region (same as Vercel region — `us-east-1` recommended)
3. Copy both connection strings:
   - **Pooled URL** → `DATABASE_URL`
   - **Direct URL** → `DIRECT_URL`

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo `aethergrid-ai`
3. **Framework Preset**: Next.js (auto-detected)
4. Add **Environment Variables**:
   ```
   DATABASE_URL   = your_neon_pooled_url
   DIRECT_URL     = your_neon_direct_url
   NEXTAUTH_SECRET = your_secret_32_chars
   ```
5. Click **Deploy**

### Step 4 — Seed Demo Data

After first deploy, run the seed in Vercel CLI or locally with prod DB:
```bash
DATABASE_URL="your_neon_url" DIRECT_URL="your_neon_url" npm run db:seed
```

Or push schema manually:
```bash
DATABASE_URL="your_neon_url" npx prisma db push
```

---

## 🧪 Demo Account

After seeding, use these credentials:
```
Email:    demo@aethergrid.ai
Password: DemoPass123!
```

The **"Try Demo Account"** button on the login page auto-creates the demo user if it doesn't exist.

---

## 🔧 NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to DB (no migration) |
| `npm run db:migrate` | Run prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run type-check` | TypeScript check |
| `npm run lint` | ESLint check |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 + framer-motion |
| **Auth** | NextAuth.js v4 (JWT + bcrypt) |
| **Database** | Neon PostgreSQL (serverless) |
| **ORM** | Prisma 5 |
| **UI** | Radix UI + Lucide Icons |
| **Charts** | Recharts + Canvas API |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand + SWR |
| **Fonts** | Space Grotesk + JetBrains Mono |
| **Deploy** | Vercel + GitHub Actions |

---

## 🐛 Troubleshooting

### "Internal server error" on Register
→ Your `DATABASE_URL` is not set. Check Vercel env vars.

### "Invalid credentials" on Login
→ Run `npm run db:seed` to create the demo user.

### Build fails with Prisma error
→ Ensure `DIRECT_URL` is set (required for Neon serverless).

### `(auth)` route conflict
→ The prebuild script auto-removes it. Force push the clean repo.

### Demo login not working
→ The demo user is auto-created on first login attempt if DB is connected.

---

## 👤 Author

**Shaik Muzzammil (Nova)**  
CSE Student · Amrita Vishwa Vidyapeetham · Chennai

- 🌐 [Portfolio](https://shaik-muzzammil-portfolio.vercel.app)
- 🔗 [Linktree](https://linktr.ee/Shaik_Muzzammil)
- 🐙 [GitHub](https://github.com/ShaikMuzzammil)

---

<div align="center">
Made with ⚡ for the edge AI future · © 2025 AetherGrid AI
</div>
