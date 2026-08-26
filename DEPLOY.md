# AetherGrid AI — Deploy in 3 Steps

## Step 1 — Set up Neon DB (free)

1. Go to **https://neon.tech** → sign up → New Project → name it `aethergrid-ai`
2. Click **Connection Details** → choose **Prisma** → copy the connection string
3. Keep it handy — you'll need it in Step 3

---

## Step 2 — Push to GitHub

**Option A — Script (recommended):**
```bash
# Extract the zip, then:
cd aethergrid-fixed
bash push.sh https://github.com/ShaikMuzzammil/aethergrid-ai.git
```
> This wipes old git history and force-replaces the GitHub repo cleanly.

**Option B — Manual git:**
```bash
cd aethergrid-fixed
rm -rf .git
rm -rf "src/app/(auth)"    # removes any leftover route group
git init
git branch -M main
git add -A
git commit -m "fix: clean AetherGrid AI"
git remote add origin https://github.com/ShaikMuzzammil/aethergrid-ai.git
git push origin main --force
```

---

## Step 3 — Vercel (auto-deploys on push)

1. Go to **https://vercel.com** → your `aethergrid-ai` project → **Settings → Environment Variables**
2. Add these variables (all environments):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `DIRECT_URL` | Same Neon connection string |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

3. Click **Deployments → Redeploy** (or just push to GitHub to trigger auto-deploy)

---

## Seed demo data (run once after deploy)

From your local machine with `.env` set:
```bash
npm install
npm run db:push
npm run db:seed
```

**Demo login:** `demo@aethergrid.ai` / `DemoPass123!`

---

## If build still fails on Vercel

Go to GitHub.com → your repo → `src/app/` and check:

- ❌ If you see **both** a `(auth)` folder AND a `login` folder → delete the `login` and `register` folders via GitHub web UI
- ❌ If you see **both** `(auth)` and `login` inside `(auth)` → delete the `(auth)` folder via GitHub web UI

Only ONE of these should exist: either `login/` at the top level OR `(auth)/login/` — never both.

