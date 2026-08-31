#!/usr/bin/env bash
set -e
REPO="${1:-}"
if [ -z "$REPO" ]; then
  echo "Usage: bash push.sh <github-repo-url>"
  exit 1
fi

echo "🚀 AetherGrid AI v6 — pushing to GitHub..."

# Clean up stale auth groups (v4 legacy)
rm -rf src/app/\(auth\) 2>/dev/null || true

git init -b main 2>/dev/null || git checkout -b main 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"

git rm -rf --cached src/app/\(auth\) 2>/dev/null || true
git add -A
git commit -m "AetherGrid AI v6 — full rebuild: simulator, command palette, notification fix, landing page, all settings working" --allow-empty

git push origin main --force
echo "✅ Pushed! Now go to Vercel and redeploy."
echo ""
echo "Required env vars in Vercel:"
echo "  DATABASE_URL   = postgresql://... (Neon connection pooling URL)"
echo "  DIRECT_URL     = postgresql://... (Neon direct URL for migrations)"
echo "  NEXTAUTH_SECRET = $(openssl rand -base64 32)"
echo "  NEXTAUTH_URL   = https://your-app.vercel.app"
echo ""
echo "Demo login after deploy: demo@aethergrid.ai / DemoPass123!"
