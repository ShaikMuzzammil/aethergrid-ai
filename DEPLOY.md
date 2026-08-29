# AetherGrid AI — Complete Deployment Guide

## ⚡ One-command deploy

```bash
bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git
```

Then set 4 env vars in Vercel and you're live.

---

## Step 1 — Get a Free Database (Neon)

1. Go to **[neon.tech](https://neon.tech)** → sign up free (no card needed)
2. Click **New Project** → name it `aethergrid-ai` → pick a region close to `iad1` (US East)
3. Click **Connect** in the dashboard
4. Copy **two** connection strings:

| Variable | Which string |
|----------|-------------|
| `DATABASE_URL` | **Pooled connection** — has `?pgbouncer=true` at the end |
| `DIRECT_URL` | **Direct connection** — shorter URL, no pgbouncer |

> **Why two?** `DATABASE_URL` is used at runtime (supports many simultaneous connections via PgBouncer). `DIRECT_URL` is used by Prisma migrations to push the schema directly.

---

## Step 2 — Generate Auth Secret

Run in your terminal:

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output — this is your `NEXTAUTH_SECRET`.

---

## Step 3 — Push to GitHub

```bash
# In the extracted project folder:
bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git
```

This initialises a fresh git history and force-pushes to your repo.

---

## Step 4 — Deploy on Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Import your GitHub repo
3. **Do NOT change the build settings** — `vercel.json` handles everything
4. Click **Environment Variables** and add all 4:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Neon pooled URL | ✅ |
| `DIRECT_URL` | Neon direct URL | ✅ |
| `NEXTAUTH_SECRET` | Output from openssl | ✅ |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | ✅ |

5. Click **Deploy**

---

## What happens during build

The `vercel.json` build command runs:

```
prisma generate → prisma db push → next build
```

- **`prisma generate`** — creates the TypeScript Prisma client
- **`prisma db push`** — creates all database tables in Neon automatically
- **`next build`** — compiles the Next.js app

You never need to run migrations manually.

---

## Step 5 — First Login

After deploy succeeds, visit your app:

### Option A — Demo Account (instant)
Click **"Try Demo Account"** on the login page.
The demo user is auto-created on first click.

### Option B — Create Your Account
Go to `/register` and sign up with any email.

### Demo Credentials
```
Email:    demo@aethergrid.ai
Password: DemoPass123!
```

---

## Troubleshooting

### "Registration failed"
**Cause:** Database tables don't exist yet.
**Fix:** Redeploy the app — the build command now runs `prisma db push` automatically.
```bash
# In Vercel: Deployments → Redeploy
```

### "Invalid credentials" on demo login
**Cause:** Demo user not created yet.
**Fix:** The demo button now auto-registers the user. If it still fails, check `NEXTAUTH_SECRET` is set.

### "Database not reachable"
**Cause:** `DATABASE_URL` or `DIRECT_URL` is wrong.
**Fix:** Go to Neon → Connect → copy the exact strings again. Make sure `DATABASE_URL` has `?pgbouncer=true&connection_limit=1` at the end.

### Build fails with TypeScript error
**Fix:** The `next.config.ts` has `typescript: { ignoreBuildErrors: true }` — no TS error should fail the build. If it does, check the Vercel build log and open a GitHub issue.

### "NEXTAUTH_URL mismatch"
**Cause:** `NEXTAUTH_URL` doesn't match the actual deployment URL.
**Fix:** Update `NEXTAUTH_URL` in Vercel env vars to match your exact Vercel URL (including `https://`).

---

## Local Development

```bash
# Install deps
npm install

# Create local env
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL=http://localhost:3000

# Push schema to your Neon DB
npx prisma db push

# Seed demo data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Free Tier Limits

| Service | Free Tier | Enough for |
|---------|-----------|-----------|
| **Neon** | 0.5 GB storage, 100 hrs compute/mo | Thousands of devices |
| **Vercel** | 100 GB bandwidth, 6000 build min/mo | Full production use |
| **NextAuth** | Unlimited | — |

No credit card needed for any of these.

---

## Optional Integrations (all free tiers available)

These unlock specific integration tiles inside the app but are **not required**:

| Integration | Free Tier | Sign Up |
|-------------|-----------|---------|
| Slack Webhooks | Unlimited | [api.slack.com](https://api.slack.com/apps) |
| SendGrid Email | 100 emails/day | [sendgrid.com](https://sendgrid.com) |
| Mapbox Maps | 50,000 tile loads/mo | [mapbox.com](https://mapbox.com) |

Add them to `.env.local` or Vercel env vars — see `.env.example` for variable names.

---

Built by [Shaik Muzzammil](https://linktr.ee/Shaik_Muzzammil) · [Portfolio](https://shaik-muzzammil-portfolio.vercel.app)
