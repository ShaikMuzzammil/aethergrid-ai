# Deployment Guide — AetherGrid AI v5

Complete step-by-step guide to deploy on Vercel with Neon PostgreSQL.

---

## Required Environment Variables

| Variable | Required | Source | Example |
|---|---|---|---|
| `DATABASE_URL` | ✅ Yes | Neon Dashboard | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | ✅ Yes | Neon Dashboard | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | ✅ Yes | Generate yourself | 32+ character random string |
| `NEXTAUTH_URL` | ✅ Yes | Your Vercel URL | `https://your-project.vercel.app` |

> **That's it — only 4 env vars needed.** Neon free tier is sufficient. No paid services required.

---

## Step 1 — Get Neon Database URLs (Free)

1. Go to [neon.tech](https://neon.tech) → **Sign up free**
2. Create a new project (any name, any region)
3. Go to **Dashboard → Connection Details**
4. Select **Pooled connection** → copy the URL  
   → This is your `DATABASE_URL` (ends with `?pgbouncer=true&connection_limit=1`)
5. Select **Direct connection** → copy the URL  
   → This is your `DIRECT_URL`

```
DATABASE_URL = postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1
DIRECT_URL   = postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 2 — Generate NEXTAUTH_SECRET

Run one of these:

```bash
# Option A — openssl (Mac/Linux)
openssl rand -base64 32

# Option B — Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option C — npx (any platform)
npx auth secret
```

Copy the output → that's your `NEXTAUTH_SECRET`.

---

## Step 3 — Deploy to Vercel

### Option A: Git push (recommended)

```bash
# From the project directory:
bash push.sh https://github.com/YourUsername/aethergrid-ai.git
```

Then:
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
2. Select your `aethergrid-ai` repo
3. **Before deploying**, click **Environment Variables** and add all 4 vars
4. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 4 — Add Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add each variable for **Production** (and optionally Preview):

```
DATABASE_URL      = [from Neon pooled connection]
DIRECT_URL        = [from Neon direct connection]
NEXTAUTH_SECRET   = [your 32-char secret]
NEXTAUTH_URL      = https://your-project-name.vercel.app
```

3. After adding all 4, go to **Deployments** → click **Redeploy** on the latest deploy

---

## Step 5 — Verify Deployment

What happens automatically on every Vercel deploy:

```
npm install
→ prisma generate      (generates type-safe Prisma client)
→ prisma db push       (syncs schema to Neon — no migrations needed)
→ prisma db seed       (creates 12 devices, 6 models, 6 deployments, etc.)
→ next build           (compiles the Next.js app)
```

After deploy:

1. Open your Vercel URL
2. Click **Try Demo** or go to `/login`
3. Use: **demo@aethergrid.ai** / **DemoPass123!**
4. You should see the full dashboard with seeded data

---

## Troubleshooting

### ❌ Build fails with Prisma error

**Cause:** DATABASE_URL not set before first deploy.  
**Fix:** Add env vars → redeploy.

### ❌ Login fails (500 error)

**Cause:** Schema not pushed to DB yet.  
**Fix:** Check Vercel build logs — look for "prisma db push" output. If it failed, trigger a redeploy after confirming env vars are set.

### ❌ "Table does not exist" error

**Cause:** db push didn't run during build.  
**Fix:** Trigger a new deploy from Vercel dashboard.

### ❌ Demo login works but data is empty

**Cause:** Seed didn't run or ran before tables existed.  
**Fix:** Redeploy — vercel.json ensures seed runs after db push.

### ❌ NEXTAUTH_URL mismatch

**Cause:** `NEXTAUTH_URL` doesn't match actual Vercel URL.  
**Fix:** Update `NEXTAUTH_URL` to exactly match your Vercel domain (no trailing slash).

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/YourUser/aethergrid-ai.git
cd aethergrid-ai
npm install

# 2. Create .env.local with your values
cp .env.example .env.local
# Edit .env.local with your Neon URLs and NEXTAUTH_SECRET

# 3. Set up database
npm run db:push    # Push schema
npm run db:seed    # Seed data

# 4. Start dev server
npm run dev

# Open http://localhost:3000
# Login: demo@aethergrid.ai / DemoPass123!
```

---

## Environment Reference

### `.env.local` (full example)

```env
# ─── Database (Neon PostgreSQL) ───────────────────────────────
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ─── NextAuth ─────────────────────────────────────────────────
NEXTAUTH_SECRET="your-super-long-random-secret-string-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
# For production Vercel: NEXTAUTH_URL="https://your-project.vercel.app"

# ─── Optional: Email (for team invitations) ───────────────────
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="you@gmail.com"
# SMTP_PASS="app-password"
# SMTP_FROM="AetherGrid AI <noreply@aethergrid.ai>"
```

> **Note:** Email is optional. Team invite URLs are shown in a toast notification even without SMTP configured.

---

## API Keys After Deployment

Once deployed:

1. Login → **Settings → API Keys** → **New Key**
2. Select permissions (e.g., `devices:read`, `models:read`)
3. Choose environment: `ag_live_` (prod) or `ag_test_` (dev)
4. Copy your key — shown only once!

Use it:
```bash
curl https://your-project.vercel.app/api/devices \
  -H "Authorization: Bearer ag_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

Built by **Nova** (Shaik Muzzammil) — [Portfolio](https://shaik-muzzammil-portfolio.vercel.app)
