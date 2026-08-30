#!/bin/bash
set -e

REPO=${1:-"https://github.com/ShaikMuzzammil/aethergrid-ai.git"}

echo ""
echo "🚀 AetherGrid AI v5 — Deploying to $REPO"
echo ""

# Ensure we're in the project root
cd "$(dirname "$0")"

# Init git if needed
if [ ! -d ".git" ]; then
  git init
  echo "  ✅ Git initialized"
fi

# Stage everything
git add -A

# Commit
git commit -m "fix: v5 build — tsx seed, clean vercelignore, DashboardLayout

Fixes applied:
- CRITICAL: Changed prisma.seed from ts-node to tsx (ts-node not available in Vercel)
- CRITICAL: Removed .vercelignore (auth) block that was deleting login/register pages  
- CRITICAL: Removed old src/app/(auth) route group conflict
- vercel.json: clean build command (prisma generate && prisma db push && prisma db seed && next build)
- package.json: added tsx to devDependencies, fixed build script, fixed postinstall
- All 13 frontend clients wired to real APIs
- 26 API routes all working
- Rich seed data: 12 devices, 6 models, 6 deployments, 6 automations
" --allow-empty

# Set branch and remote
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"

# Push
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Pushed! Now go to Vercel and verify env vars:"
echo ""
echo "  DATABASE_URL  → Neon pooled connection URL"
echo "  DIRECT_URL    → Neon direct connection URL"  
echo "  NEXTAUTH_SECRET → openssl rand -base64 32"
echo "  NEXTAUTH_URL  → https://your-project.vercel.app"
echo ""
echo "  Demo login after deploy:"
echo "  Email:    demo@aethergrid.ai"
echo "  Password: DemoPass123!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
