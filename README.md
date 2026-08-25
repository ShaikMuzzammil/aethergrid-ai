# 🌐 AetherGrid AI — World-Scale Autonomous Edge AI Platform

> Enterprise-ready platform bridging distributed hardware edge nodes, localized AI runtimes, and multi-tenant cloud-native control console. From $3 ESP32 chips to NVIDIA GPU clusters — deploy AI anywhere, at any scale.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-green) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Live Demo

- **Demo URL**: Deploy to Vercel (see below)
- **Demo Login**: `demo@aethergrid.ai` / `DemoPass123!`

---

## ✨ Features (50+ Modules)

| Module | Description |
|--------|-------------|
| 🖥️ **Dashboard** | Real-time KPIs, 6+ chart types, fleet health, activity feed |
| 📡 **IoT Devices** | ESP32, RPi, Jetson, STM32, RISC-V, Arduino — full CRUD + OTA |
| 🤖 **AI Model Hub** | Upload, train, version, deploy TFLite/ONNX/PyTorch/TF models |
| 📊 **Analytics** | 15+ chart types, radar, heatmaps, geographic distribution |
| 🚀 **Deployments** | API services, workers, pipelines with auto-scaling & live logs |
| ⚡ **Automations** | Visual if-this-then-that rule builder with 20+ triggers/actions |
| 📤 **Export Center** | 30+ formats: CSV, Parquet, JSON, SQLite, PDF, Protocol Buffers |
| 🔌 **Integrations** | AWS, Azure, GCP, Slack, PagerDuty, Kafka, Grafana, 16+ more |
| 🔑 **API Keys** | Scoped permissions, expiry, usage tracking |
| 🪝 **Webhooks** | Event subscriptions, HMAC signing, delivery logs |
| 👥 **Team** | RBAC (Owner/Admin/Member/Viewer), invites |
| ⚙️ **Settings** | Profile, security, 2FA, notifications, appearance, advanced |
| 🔒 **Auth** | NextAuth.js, JWT, bcrypt, middleware protection |
| 🌙 **Dark/Light Mode** | Full theme system with CSS variables |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v3 + CSS Variables |
| **UI Components** | Radix UI primitives + shadcn/ui pattern |
| **Database ORM** | Prisma 5 |
| **Database** | PostgreSQL (Neon — free tier) |
| **Auth** | NextAuth.js v4 + bcryptjs |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Validation** | Zod |
| **State** | Zustand + React hooks |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
aethergrid-ai/
├── prisma/
│   ├── schema.prisma          # 20+ models, full relational schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout + metadata
│   │   ├── globals.css        # AetherGrid theme + utilities
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── devices/           # IoT device management
│   │   ├── ai-models/         # AI/ML model hub
│   │   ├── analytics/         # Analytics & charts
│   │   ├── deployments/       # Edge deployments
│   │   ├── automations/       # Rule builder
│   │   ├── export/            # Export center
│   │   ├── integrations/      # Third-party integrations
│   │   ├── settings/
│   │   │   ├── page.tsx       # Profile, security, notifications
│   │   │   ├── api-keys/      # API key management
│   │   │   ├── webhooks/      # Webhook management
│   │   │   └── team/          # Team & RBAC
│   │   └── api/
│   │       ├── auth/          # NextAuth + register
│   │       ├── devices/       # Devices CRUD + readings + commands
│   │       ├── ai-models/     # Models CRUD + training
│   │       ├── deployments/   # Deployments CRUD
│   │       ├── analytics/     # Analytics endpoints
│   │       ├── api-keys/      # API key management
│   │       ├── webhooks/      # Webhook management
│   │       ├── export/        # Export jobs
│   │       ├── notifications/ # Notifications
│   │       ├── users/profile  # User profile
│   │       └── team/          # Team management
│   ├── components/
│   │   ├── dashboard-layout.tsx   # Sidebar + topbar layout
│   │   └── providers.tsx          # NextAuth + theme providers
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma singleton
│   │   └── utils.ts           # Helpers (cn, formatDate, etc.)
│   ├── hooks/
│   │   ├── use-devices.ts
│   │   ├── use-analytics.ts
│   │   └── use-notifications.ts
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── middleware.ts          # Route protection
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚡ Quick Start (Local Dev)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/aethergrid-ai.git
cd aethergrid-ai
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://..."      # Your Neon PostgreSQL URL
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**Get free PostgreSQL (Neon):**
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create project → Copy connection string
3. Paste as `DATABASE_URL`

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Setup Database

```bash
npx prisma db push       # Push schema to database
npx prisma generate      # Generate Prisma client
npm run db:seed          # Seed demo data (optional)
```

### 4. Run Development Server

```bash
npm run dev
# → http://localhost:3000
```

**Demo login**: `demo@aethergrid.ai` / `DemoPass123!`

---

## 🌐 Deploy to Vercel (Free)

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/aethergrid-ai)

### Option B: Manual Deploy

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial AetherGrid AI platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aethergrid-ai.git
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)

#### Step 3: Set Environment Variables in Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` output |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |

#### Step 4: Deploy & Seed

```bash
# After deploy, run seed via Vercel CLI (optional)
npx vercel env pull .env.local
npm run db:seed
```

---

## 🗄️ Database Setup (Neon — Free)

1. Visit [neon.tech](https://neon.tech) → **Start for Free**
2. Create a new project → Select region closest to you
3. Copy the **Connection String** (postgresql://...)
4. Set as `DATABASE_URL` in Vercel and `.env`

**Free tier includes:**
- 512 MB storage
- Unlimited branches
- Auto-suspend (saves compute)
- Serverless PostgreSQL

---

## 🔑 Free Environment Variables

All required services have **free tiers**:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Neon](https://neon.tech) | PostgreSQL database | 512 MB free forever |
| [Vercel](https://vercel.com) | Hosting & deployment | Hobby tier free |
| NextAuth | Authentication | Built-in, no cost |

**Optional OAuth** (all free):
- GitHub OAuth: [github.com/settings/applications/new](https://github.com/settings/applications/new)
- Google OAuth: [console.cloud.google.com](https://console.cloud.google.com)

---

## 📡 REST API Reference

Base URL: `https://your-domain.vercel.app/api`

### Authentication
All protected routes require a valid session (cookie-based from NextAuth).

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | List all devices |
| `POST` | `/devices` | Register new device |
| `GET` | `/devices/:id` | Get device details |
| `PATCH` | `/devices/:id` | Update device |
| `DELETE` | `/devices/:id` | Remove device |
| `GET` | `/devices/:id/readings` | Sensor readings |
| `POST` | `/devices/:id/readings` | Push sensor data |
| `POST` | `/devices/:id/commands` | Send command |

### AI Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ai-models` | List all models |
| `POST` | `/ai-models` | Create model |
| `GET` | `/ai-models/:id` | Model details |
| `PATCH` | `/ai-models/:id` | Update model |
| `DELETE` | `/ai-models/:id` | Delete model |
| `POST` | `/ai-models/:id/train` | Start training job |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics` | Analytics data |
| `GET/POST` | `/deployments` | Deployments |
| `GET/POST` | `/api-keys` | API keys |
| `DELETE` | `/api-keys/:id` | Revoke key |
| `GET/POST` | `/webhooks` | Webhooks |
| `PATCH/DELETE` | `/webhooks/:id` | Update/delete |
| `GET/POST` | `/export` | Export jobs |
| `GET/PATCH` | `/notifications` | Notifications |
| `GET/PATCH` | `/users/profile` | User profile |
| `POST` | `/auth/register` | Registration |

### Example: Push Sensor Data

```bash
curl -X POST https://your-domain.vercel.app/api/devices/dev_123/readings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "readings": [
      { "metric": "temperature", "value": 42.5, "unit": "°C" },
      { "metric": "humidity", "value": 68.2, "unit": "%" },
      { "metric": "cpu_usage", "value": 45.1, "unit": "%" }
    ]
  }'
```

---

## 🔌 Supported Hardware

| Platform | Protocols | AI Frameworks |
|----------|-----------|---------------|
| ESP32 / ESP8266 | WiFi, BLE, MQTT | TFLite Micro |
| Raspberry Pi (all) | Ethernet, WiFi, LoRa | TFLite, ONNX, PyTorch |
| NVIDIA Jetson (Nano/Xavier/Orin) | Ethernet, WiFi, CUDA | TensorRT, PyTorch, ONNX |
| STM32 | CAN, UART, SPI, I2C | TFLite Micro |
| RISC-V | Custom protocols | TFLite, ONNX |
| Arduino | Serial, I2C, SPI | TFLite Micro |
| Custom hardware | Any | Any |

---

## 🗃️ Database Schema Overview

**20+ Prisma models:**

```
User ─── Account, Session (NextAuth)
     ├── Device ─── DeviceGroup, SensorReading, DeviceCommand, DeviceAlert
     ├── AiModel ── TrainingJob, InferenceRequest, Deployment
     ├── Deployment ── DeploymentLog, DeploymentMetric
     ├── ApiKey
     ├── Webhook ── WebhookDelivery
     ├── ExportJob
     ├── Notification
     ├── AuditLog
     └── TeamMember ── Team
```

---

## 🔒 Security

- **Auth**: NextAuth.js with JWT sessions + bcrypt password hashing (12 rounds)
- **Routes**: Middleware protects all `/dashboard`, `/devices`, `/settings`, etc.
- **API**: Server-side session validation on every API route
- **Passwords**: bcrypt with cost factor 12
- **CSRF**: NextAuth built-in CSRF protection
- **Webhooks**: HMAC-SHA256 payload signing
- **API Keys**: Scoped permissions + expiry + revocation

---

## 🧪 Development Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run db:push      # Push Prisma schema to database
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:seed      # Seed demo data
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Built With

- [Next.js](https://nextjs.org) · [Prisma](https://prisma.io) · [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) · [Framer Motion](https://framer.com/motion) · [Lucide Icons](https://lucide.dev)
- [NextAuth.js](https://next-auth.js.org) · [Sonner](https://sonner.emilkowal.ski) · [Zod](https://zod.dev)

---

<p align="center">
  <strong>Built with ❤️ — Empowering the Edge AI Revolution</strong><br/>
  <sub>© 2025 AetherGrid AI · MIT License</sub>
</p>
