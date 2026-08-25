# 🚀 AetherGrid AI — Complete Deployment Guide

## ✅ Pre-Deployment Checklist

- [ ] Neon PostgreSQL account created ([neon.tech](https://neon.tech))
- [ ] GitHub repo created and code pushed
- [ ] Vercel account ready ([vercel.com](https://vercel.com))
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `DATABASE_URL` copied from Neon

---

## Step 1 — Get Free PostgreSQL (Neon)

1. Go to **[neon.tech](https://neon.tech)** → Sign up (GitHub login works)
2. Click **"New Project"** → Name it `aethergrid-ai`
3. Select closest region (e.g. `US East`, `EU West`, `Asia Pacific`)
4. After creation → click **"Connection Details"**
5. Copy the **Connection String** — looks like:
   ```
   postgresql://alex:AbcXyz123@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. Save this as `DATABASE_URL`

---

## Step 2 — Push Code to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "feat: AetherGrid AI v1.0.0 - full platform"
git branch -M main

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
2. Click **"Import Git Repository"** → Select `aethergrid-ai`
3. Framework Preset: **Next.js** (auto-detected ✅)
4. **DO NOT deploy yet** — add env vars first

### Add Environment Variables in Vercel:

Click **"Environment Variables"** and add these:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Neon Step 1 |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` | Generate locally |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` | Your Vercel URL |

> **Getting NEXTAUTH_SECRET:**
> ```bash
> # Mac/Linux:
> openssl rand -base64 32
>
> # Windows PowerShell:
> [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
>
> # Or use online: https://generate-secret.vercel.app/32
> ```

5. Click **"Deploy"** → Wait ~2 minutes ⏳

---

## Step 4 — Initialize Database

After first deployment succeeds, the schema auto-migrates via `prisma generate` in the build.

**Optional: Seed demo data** (adds demo user + sample devices/models):

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull env vars
vercel env pull .env.local

# Run seed
npm run db:seed
```

**Or run seed via Prisma Studio:**
```bash
npx prisma db push   # Ensure schema is applied
npm run db:seed      # Seed demo data
```

After seeding:
- 🔑 **Demo**: `demo@aethergrid.ai` / `DemoPass123!`
- 🔑 **Admin**: `admin@aethergrid.ai` / `DemoPass123!`

---

## Step 5 — Verify Deployment

Visit your Vercel URL and check:

- [ ] Landing page loads (`/`)
- [ ] Register works (`/register`)
- [ ] Login works (`/login`)
- [ ] Dashboard loads (`/dashboard`)
- [ ] Devices page works (`/devices`)
- [ ] AI Models page works (`/ai-models`)
- [ ] Analytics page works (`/analytics`)

---

## 🔧 Environment Variables Reference

### Required

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_SECRET=<32+ random chars>
NEXTAUTH_URL=https://your-project.vercel.app
```

### Optional (OAuth Login)

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Setup GitHub OAuth:**
1. GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Homepage URL: `https://your-project.vercel.app`
3. Callback URL: `https://your-project.vercel.app/api/auth/callback/github`
4. Copy Client ID and Secret to Vercel env vars

**Setup Google OAuth:**
1. [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect: `https://your-project.vercel.app/api/auth/callback/google`

---

## 🐛 Troubleshooting

### Build Fails — Prisma error
```
Error: @prisma/client did not initialize yet
```
**Fix:** Ensure `DATABASE_URL` is set in Vercel env vars. Check Vercel → Settings → Environment Variables.

### 500 on /api routes
**Fix:** Check Vercel Function Logs. Usually missing `DATABASE_URL` or `NEXTAUTH_SECRET`.

### Login redirects loop
**Fix:** Set `NEXTAUTH_URL` exactly to your Vercel URL (no trailing slash).

### Database connection error
**Fix:**
1. Check Neon project is active (auto-pauses on free tier after inactivity)
2. Click "Wake" on Neon dashboard
3. Verify connection string includes `?sslmode=require`

### Prisma schema out of sync
```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

---

## ⚡ Performance Tips

1. **Neon Autoscale**: Enable on Neon dashboard for production
2. **Vercel Edge**: API routes run on Vercel's global edge network
3. **Image Optimization**: Next.js auto-optimizes images
4. **Static Pages**: Landing page is statically generated
5. **Connection Pooling**: Prisma uses singleton client for dev

---

## 🔄 Updating the App

```bash
# Make changes, then:
git add .
git commit -m "feat: your changes"
git push origin main
# Vercel auto-deploys on push ✅
```

---

## 📊 Monitoring

- **Vercel Analytics**: Enable in Vercel dashboard → Analytics tab (free)
- **Vercel Logs**: Dashboard → Functions → View logs
- **Neon Metrics**: Neon dashboard → Monitoring tab
- **Error Tracking**: Add [Sentry](https://sentry.io) (free tier available)

---

<p align="center">
  <strong>🚀 Your AetherGrid AI platform is live!</strong>
</p>
