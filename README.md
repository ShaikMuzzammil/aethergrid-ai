<div align="center">

# ⚡ AetherGrid AI

### World-Scale Autonomous Edge AI & Hardware OS Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?logo=tailwind-css)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

*From $3 ESP32 chips to GPU clusters — deploy AI anywhere, at any scale.*

[Live Demo](#demo) · [Quick Start](#quick-start) · [Full Guide](./GUIDE.md)

</div>

---

## Features

- **Edge Device Management** — ESP32, Raspberry Pi, NVIDIA Jetson, STM32, Arduino, RISC-V  
- **AI Model Lifecycle** — Train, version, and deploy ONNX/TFLite/PyTorch models to edge nodes  
- **Real-time Analytics** — Sensor streams, CPU/memory/temperature, geo-distributed dashboards  
- **Automation Engine** — Visual if/then rule builder for event-driven fleet control  
- **Team Collaboration** — RBAC with Owner / Admin / Member / Viewer roles  
- **API-First** — 18 REST endpoints, API key management, webhook subscriptions  
- **Export Center** — 30+ formats (CSV, JSON, Parquet, InfluxDB, Prometheus, MQTT...)  
- **16 Integrations** — AWS IoT, Azure, Grafana, Kafka, Slack, Datadog, and more  

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env → set DATABASE_URL + NEXTAUTH_SECRET

# 3. Set up database
npm run db:push && npm run db:seed

# 4. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with `demo@aethergrid.ai` / `DemoPass123!`

---

## Deploy to Vercel (3 steps)

1. Push to GitHub  
2. Import repo on [vercel.com](https://vercel.com)  
3. Set `DATABASE_URL` + `NEXTAUTH_SECRET` in Vercel environment variables

See [GUIDE.md](./GUIDE.md) for the complete step-by-step deployment guide.

---

## Stack

Next.js 15 · TypeScript · Prisma · Neon PostgreSQL · NextAuth · Tailwind CSS · Recharts · Framer Motion

---

<div align="center">
<sub>Built with ❤️ — AetherGrid AI Platform v1.0.0</sub>
</div>
