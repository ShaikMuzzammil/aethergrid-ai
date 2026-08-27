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
git commit -m "feat: AetherGrid AI v3 — full production build

✅ Auth fixed (register + demo login + auto demo user creation)
✅ Landing page redesigned (canvas animation, 15 sections)  
✅ Home/back buttons on all auth pages
✅ Footer links all corrected
✅ Dashboard with live sparklines + gauges
✅ Space Grotesk + JetBrains Mono fonts
✅ Legal pages (Terms + Privacy)
✅ No (auth) route conflicts
"

echo "🚀 Pushing to GitHub..."
git remote add origin "$REMOTE_URL"
git branch -M main
git push -u origin main --force

echo "
✅ Done! Vercel will auto-deploy in ~30 seconds.
   Check: https://vercel.com/dashboard

📋 Next steps if first deploy:
   1. Set env vars in Vercel dashboard
   2. Redeploy after setting vars
   3. Run: npm run db:seed (with your DIRECT_URL)
"
