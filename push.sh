#!/bin/bash
set -e
REPO=${1:-"https://github.com/ShaikMuzzammil/aethergrid-ai.git"}
echo "🚀 Pushing AetherGrid AI v5 to $REPO"
git init
git add -A
git commit -m "feat: AetherGrid AI v5 - full large-scale rebuild

- All frontend clients wired to real API endpoints
- Working CRUD: devices, models, deployments, automations
- Real API key generation with env/permission scopes
- Working webhooks with HMAC secret display
- Full team management with role-based invite flow
- All settings tabs save to DB (profile, security, notifications, appearance)
- Complete analytics with time-range filtering + CSV export
- Working data export with download functionality
- 8-provider integrations with config modals
- Automation rule builder with trigger + action config
- New Automation, Integration models in Prisma schema
- Dashboard fetches real data from /api/dashboard
- Seed data: 12 devices, 6 models, 6 deployments, 6 automations, API keys, webhooks, notifications
- Landing page: enhanced NetworkCanvas with 48 nodes, mouse repulsion, data packets + trails, pulse rings
- Landing page: removed pricing, added Home/Dashboard button in nav
- Comprehensive docs page with code examples for Python/Node/ESP32
- vercel.json: auto-runs db push + seed on every deploy
- README.md + DEPLOY.md fully updated
" --allow-empty
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"
git push -u origin main --force
echo "✅ Pushed! Now set env vars in Vercel:"
echo "   DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL"
