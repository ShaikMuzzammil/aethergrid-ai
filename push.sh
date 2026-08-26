#!/bin/bash
# ================================================================
# AetherGrid AI — GitHub Force Push Script
# Run this ONCE from inside the aethergrid-ai folder after
# extracting the ZIP. It replaces the old repo completely.
# ================================================================

echo "🚀 AetherGrid AI — GitHub Force Push"
echo "======================================"

# Ask for the GitHub repo URL
if [ -z "$1" ]; then
  echo ""
  echo "Usage:  bash push.sh https://github.com/YOUR_USERNAME/aethergrid-ai.git"
  echo "   or:  bash push.sh  (prompts for URL)"
  echo ""
  read -p "Enter your GitHub repo URL: " REPO_URL
else
  REPO_URL="$1"
fi

if [ -z "$REPO_URL" ]; then
  echo "❌ No URL provided. Exiting."
  exit 1
fi

echo ""
echo "📦 Initialising fresh git history..."

# Wipe any old git state and start fresh
rm -rf .git
git init
git branch -M main

echo "📄 Staging all files (including deletions of old paths)..."
git add -A

echo "💾 Creating commit..."
git commit -m "feat: AetherGrid AI v2 — all build errors fixed

Fixes:
- Prisma schema: 15 single-line enums → multi-line format
- auth pages: consolidated into (auth) group only (no duplicates)
- autoprefixer: added to devDependencies
- Next.js: upgraded to 15.5.24 (all CVEs patched)
- async params: all [id] routes updated for Next.js 15
- next.config.ts: serverExternalPackages (Next.js 15 API)"

echo "🌐 Connecting to GitHub..."
git remote add origin "$REPO_URL"

echo "⬆️  Force-pushing (replaces all old files on GitHub)..."
git push origin main --force

echo ""
echo "✅ Done! Vercel will auto-deploy in ~30 seconds."
echo "   Check: https://vercel.com/dashboard"
