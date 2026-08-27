# AetherGrid AI — Complete Deployment Guide

## Table of Contents
1. [Environment Setup](#1-environment-setup)
2. [Neon Database Setup](#2-neon-database-setup)
3. [Local Development](#3-local-development)
4. [GitHub Setup](#4-github-setup)
5. [Vercel Deployment](#5-vercel-deployment)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Database Commands](#7-database-commands)
8. [Auth & Demo Account](#8-auth--demo-account)
9. [API Reference](#9-api-reference)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Environment Setup

### Requirements
- Node.js 20+ (`node --version`)
- npm 10+ (`npm --version`)
- Git (`git --version`)

### Install project
```bash
npm install
cp .env.example .env
```

---

## 2. Neon Database Setup

1. Go to https://neon.tech → Sign up free
2. Click **New Project** → Name it `aethergrid-ai`
3. Select region: `US East (N. Virginia)` (closest to Vercel `iad1`)
4. After creation, go to **Dashboard → Connection Details**
5. Select **Connection string** → Copy **Pooled** URL for `DATABASE_URL`
6. Switch to **Direct** connection → Copy for `DIRECT_URL`

Both URLs look like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **Important**: Both `DATABASE_URL` and `DIRECT_URL` are REQUIRED for Neon.  
> `DATABASE_URL` = pooled (for serverless)  
> `DIRECT_URL` = direct (for Prisma migrations and seed)

---

## 3. Local Development

```bash
# Fill .env with your values
nano .env

# Push schema to Neon
npm run db:push

# Seed demo data (creates demo user + sample devices/models)
npm run db:seed

# Start development
npm run dev
# → http://localhost:3000
```

### What the seed creates:
- Demo user: `demo@aethergrid.ai` / `DemoPass123!`
- Admin user: `admin@aethergrid.ai` / `DemoPass123!`
- 8 sample devices (ESP32, Jetson, RPi, STM32, etc.)
- 5 AI models (YOLOv8, Anomaly Sentinel, NLP classifier, etc.)
- 3 device groups
- 5 notifications
- 24h of sensor readings

---

## 4. GitHub Setup

### Fresh push (replaces any old broken repo)
```bash
# Inside the project folder
git init
git add .
git commit -m "feat: aethergrid-ai v3 — full production build"

# Replace YOUR_USERNAME
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git branch -M main
git push -u origin main --force
```

> **IMPORTANT**: Use `--force` to overwrite any old conflicting files  
> (especially `src/app/(auth)/` which caused previous build failures)

---

## 5. Vercel Deployment

### Step-by-step

1. Go to https://vercel.com → **Add New Project**
2. Click **Import Git Repository** → Select `aethergrid-ai`
3. Vercel auto-detects Next.js — do **not** change Build Command
4. In **Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon pooled URL |
| `DIRECT_URL` | Your Neon direct URL |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |

> Do **NOT** set `NEXTAUTH_URL` on Vercel — it is auto-set.

5. Click **Deploy** → Wait ~2 minutes

### After deploy — seed the cloud DB

Option A (local, using Neon URLs directly):
```bash
DATABASE_URL="your_neon_pooled_url" \
DIRECT_URL="your_neon_direct_url" \
NEXTAUTH_SECRET="your_secret" \
npm run db:seed
```

Option B (Vercel CLI):
```bash
npm i -g vercel
vercel env pull .env.production
npx dotenv -e .env.production -- npm run db:seed
```

---

## 6. Environment Variables Reference

```bash
# ═══════════════════════════════════════════════════════
# REQUIRED — App will not work without these
# ═══════════════════════════════════════════════════════

# Neon PostgreSQL — Pooled connection (for runtime queries)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# Neon PostgreSQL — Direct connection (for migrations/seed)
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth secret — MUST be a random 32+ char string
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your_random_secret_here"

# ═══════════════════════════════════════════════════════
# OPTIONAL — For OAuth providers
# ═══════════════════════════════════════════════════════

# GitHub OAuth (https://github.com/settings/applications/new)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ═══════════════════════════════════════════════════════
# LOCAL ONLY — Auto-set by Vercel in production
# ═══════════════════════════════════════════════════════
NEXTAUTH_URL="http://localhost:3000"
```

---

## 7. Database Commands

```bash
# Push schema changes to DB (no migration file)
npm run db:push

# Run saved migrations (for production use)
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio GUI
npm run db:studio

# Regenerate Prisma client (after schema changes)
npm run db:generate

# Reset DB (WARNING: deletes all data)
npx prisma db push --force-reset
```

---

## 8. Auth & Demo Account

### Demo Login
URL: `/login` → Click **"Try Demo Account"**

The button will:
1. Try to sign in as `demo@aethergrid.ai`
2. If user doesn't exist, auto-creates it via `/api/auth/register`
3. Signs in automatically

If this fails, it means `DATABASE_URL` is not properly set.

### Default credentials (after seed)
```
Demo:  demo@aethergrid.ai  / DemoPass123!
Admin: admin@aethergrid.ai / DemoPass123!
```

### Password requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

---

## 9. API Reference

All endpoints require authentication via NextAuth session cookie.

### Devices
```
GET    /api/devices          — List all devices
POST   /api/devices          — Create device
GET    /api/devices/:id      — Get device
PATCH  /api/devices/:id      — Update device
DELETE /api/devices/:id      — Delete device
GET    /api/devices/:id/readings  — Get sensor readings
POST   /api/devices/:id/commands  — Send command
```

### AI Models
```
GET    /api/ai-models        — List models
POST   /api/ai-models        — Create model
GET    /api/ai-models/:id    — Get model
PATCH  /api/ai-models/:id    — Update model
POST   /api/ai-models/:id/train — Start training job
```

### Deployments
```
GET    /api/deployments      — List deployments
POST   /api/deployments      — Create deployment
PATCH  /api/deployments/:id  — Update status
DELETE /api/deployments/:id  — Remove deployment
```

### Analytics
```
GET    /api/analytics        — Get aggregated metrics
       Query: ?period=24h|7d|30d&deviceId=xxx
```

### Notifications
```
GET    /api/notifications    — List notifications
PATCH  /api/notifications    — { action: "markAllRead" }
```

### Export
```
POST   /api/export           — Create export job
       Body: { format: "csv"|"json"|"pdf", type: "devices"|"analytics" }
```

### Auth
```
POST   /api/auth/register    — Create account
POST   /api/auth/[...nextauth] — NextAuth endpoints
```

---

## 10. Troubleshooting

### Build Errors

| Error | Fix |
|-------|-----|
| `P1012: Prisma schema error` | Schema enums must be multiline (already fixed in this build) |
| `Module not found: autoprefixer` | Already in devDependencies — run `npm install` |
| `Duplicate route (auth)` | Prebuild script removes it automatically |
| `serverComponentsExternalPackages invalid` | Changed to `serverExternalPackages` (Next.js 15) |

### Runtime Errors

| Error | Fix |
|-------|-----|
| "Internal server error" on register | DATABASE_URL not set or DB not accessible |
| "Invalid credentials" on login | Run `npm run db:seed` to create demo user |
| JWT errors | Ensure NEXTAUTH_SECRET is set |
| Prisma connection error | Add DIRECT_URL env var |

### Common Vercel Issues

1. **Build fails** → Check build logs, ensure all env vars are set
2. **DB not connecting** → Verify Neon URL is correct, check SSL mode
3. **Auth not working** → NEXTAUTH_SECRET must be set, min 32 chars
4. **404 on API routes** → Vercel auto-handles, no manual config needed

---

## Force-Redeploy (if stuck)

```bash
# 1. Extract fresh zip
# 2. Rename folder
mv aethergrid-ai-v3 aethergrid-ai
cd aethergrid-ai

# 3. Fresh git
rm -rf .git
git init
git add .
git commit -m "fresh: clean production build"

# 4. Force push
git remote add origin https://github.com/ShaikMuzzammil/aethergrid-ai.git
git branch -M main
git push -u origin main --force

# Vercel picks it up in ~30 seconds automatically
```
