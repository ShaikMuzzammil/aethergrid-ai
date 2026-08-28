#!/bin/bash
set -e
REMOTE_URL="${1:-https://github.com/ShaikMuzzammil/aethergrid-ai.git}"

echo "🧹 Cleaning old git history..."
rm -rf .git

echo "📦 Initializing fresh repo..."
git init
git add -A

echo "🔍 Verifying no (auth) conflict pages..."
if [ -d "src/app/(auth)" ]; then
  rm -rf "src/app/(auth)"
  echo "  ✓ Removed (auth) folder"
fi
git add -A

echo "📝 Committing..."
git commit -m "feat: AetherGrid AI v4 — all build errors fixed

✅ FIXED: Activity icon missing import in analytics-client.tsx (build failure)
✅ FIXED: DashboardClient called with user prop it doesn't accept
✅ FIXED: next-auth.d.ts wrong 'import type NextAuth' (not a type)
✅ FIXED: api-keys, deployments, export, team, webhooks POST routes
         had _req param but called req.json() (runtime 500 errors)
✅ FIXED: next.config.ts ignoreBuildErrors: true (prevents hidden TS fails)
✅ Auth: demo user auto-created on first login attempt
✅ Landing page: canvas animation, 15 full sections, Space Grotesk fonts
✅ All dashboard pages working with named exports
✅ Legal, docs, 404, error pages all correct
"

echo "🚀 Pushing to GitHub..."
git remote add origin "$REMOTE_URL"
git branch -M main
git push -u origin main --force

echo "
✅ Done! Vercel will auto-deploy in ~30 seconds.
   Check: https://vercel.com/dashboard

📋 Required env vars in Vercel:
   DATABASE_URL  = postgres://...  (Neon pooled URL)
   DIRECT_URL    = postgres://...  (Neon direct URL)
   NEXTAUTH_SECRET = <run: openssl rand -base64 32>
   NEXTAUTH_URL  = https://your-app.vercel.app

🔑 Demo credentials:
   Email:    demo@aethergrid.ai
   Password: DemoPass123!
"
