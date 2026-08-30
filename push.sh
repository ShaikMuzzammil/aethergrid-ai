#!/bin/bash
set -e

REPO=${1:-"https://github.com/ShaikMuzzammil/aethergrid-ai.git"}

echo ""
echo "🚀 AetherGrid AI v5 — Pushing to $REPO"
echo ""

cd "$(dirname "$0")"

# Init git if needed
if [ ! -d ".git" ]; then
  git init
  git remote add origin "$REPO"
fi

# Explicitly remove the old (auth) route group from git tracking
# This ensures it's deleted from the remote repo, not just absent locally
if git ls-files --error-unmatch "src/app/(auth)" >/dev/null 2>&1; then
  git rm -rf "src/app/(auth)" 2>/dev/null && echo "  🗑  Removed old (auth) route group from git"
fi
# Also delete local copy in case it crept back in
rm -rf "src/app/(auth)" 2>/dev/null || true

# Stage all changes (including deletions)
git add -A

# Commit
git commit -m "fix: remove (auth) route conflict, fix next.config.ts for Next.js 15

- Deleted src/app/(auth)/ — conflicted with /login and /register routes
- Fixed next.config.ts: serverComponentsExternalPackages → serverExternalPackages
- vercel.json buildCommand: rm -rf src/app/(auth) guard before next build
- prisma.seed: tsx (not ts-node) — works in Vercel build environment
" --allow-empty

git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"

echo "📤 Force-pushing to GitHub..."
git push -u origin main --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Done! Vercel will auto-deploy."
echo ""
echo "  Required env vars in Vercel dashboard:"
echo "  DATABASE_URL    → Neon pooled URL"
echo "  DIRECT_URL      → Neon direct URL"
echo "  NEXTAUTH_SECRET → openssl rand -base64 32"
echo "  NEXTAUTH_URL    → https://your-project.vercel.app"
echo ""
echo "  Demo:  demo@aethergrid.ai / DemoPass123!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
