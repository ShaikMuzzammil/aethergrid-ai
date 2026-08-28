# AetherGrid AI — Deployment Guide

## One-Shot Deploy

```bash
bash push.sh https://github.com/YourUsername/aethergrid-ai.git
```

## Required Vercel Environment Variables

| Variable | Value | Where to get |
|----------|-------|-------------|
| `DATABASE_URL` | `postgres://...?pgbouncer=true&connection_limit=1` | Neon → Connection String (pooled) |
| `DIRECT_URL` | `postgres://...` | Neon → Connection String (direct) |
| `NEXTAUTH_SECRET` | Random string | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

## Step-by-Step

1. **Create Neon Database** (free at neon.tech)
   - New project → copy both connection strings

2. **Push to GitHub**
   ```bash
   bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git
   ```

3. **Connect to Vercel**
   - Import GitHub repo at vercel.com/new
   - Add all 4 env vars
   - Deploy

4. **Seed the Database** (optional but recommended)
   ```bash
   # In the repo root with DIRECT_URL set:
   npm run db:push && npm run db:seed
   ```

## Demo Credentials

After first deploy (or after seeding), log in with:

- **Email:** `demo@aethergrid.ai`
- **Password:** `DemoPass123!`

> **Note:** If you don't run db:seed, the demo user is **auto-created** on first login attempt — just click "Demo Login" on the login page.

## Build Troubleshooting

| Error | Fix |
|-------|-----|
| `DATABASE_URL is not set` | Add env vars to Vercel |
| `Invalid credentials` | Click "Demo Login" — it auto-creates the user |
| `Registration failed` | Check DATABASE_URL is the pooled URL |
| `Internal server error` | Check NEXTAUTH_SECRET is set |

## Tech Stack

- **Framework:** Next.js 15.5 + TypeScript + Tailwind CSS
- **Auth:** NextAuth.js v4 with JWT sessions
- **Database:** PostgreSQL via Prisma + Neon
- **UI:** Lucide React + Recharts + Framer Motion + Sonner
- **Fonts:** Space Grotesk (display) + JetBrains Mono (code)
- **Deploy:** Vercel Edge Network
