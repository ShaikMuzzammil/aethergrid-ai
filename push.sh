#!/bin/bash
# ============================================================
# AetherGrid AI — One-Shot GitHub Deploy Script
# 
# USAGE:
#   cd aethergrid-fixed
#   bash push.sh https://github.com/ShaikMuzzammil/aethergrid-ai.git
# ============================================================

REPO_URL="${1}"
if [ -z "$REPO_URL" ]; then
  read -p "GitHub repo URL (e.g. https://github.com/USER/REPO.git): " REPO_URL
fi
[ -z "$REPO_URL" ] && echo "❌ No URL provided." && exit 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AetherGrid AI — Force Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wipe any old .git completely
echo "① Wiping old git history..."
rm -rf .git

# Safety: remove (auth) if it somehow exists
echo "② Removing any (auth) route group..."
rm -rf "src/app/(auth)"

# Fresh git
echo "③ Fresh git init..."
git init
git branch -M main

# Stage everything (new files + any deletions)
echo "④ Staging all files..."
git add -A

git status --short | head -20
echo "   (showing first 20 changed files)"

echo "⑤ Committing..."
git commit -m "fix: AetherGrid AI v4 — clean build, no route conflicts

Changes:
- Auth pages: ONLY at /login and /register (no (auth) group)
- No duplicate route pages
- Next.js 15.5.24 (all CVEs patched)
- autoprefixer in devDependencies
- Prisma: all 15 enums in multi-line format
- All [id] routes use async params (Next.js 15)
- next.config.ts uses serverExternalPackages (Next.js 15 API)"

echo "⑥ Setting remote to: $REPO_URL"
git remote add origin "$REPO_URL" 2>/dev/null || \
  git remote set-url origin "$REPO_URL"

echo "⑦ Force pushing to GitHub..."
git push origin main --force

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Done! Vercel auto-deploys now."
echo "  Watch: https://vercel.com/dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
