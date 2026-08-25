"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu, Radio, Brain, Zap, Shield, Globe, BarChart3, Layers, Code,
  ChevronRight, Check, Star, ArrowRight, Activity, Server, Wifi,
  Lock, RefreshCw, Database, Terminal, Network, Eye, Rocket,
  CircuitBoard, Bot, TrendingUp, Users, Menu, X
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 overflow-x-hidden">
      {/* Animated bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/30 bg-[#080c14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <CircuitBoard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">
              <span className="gradient-text">Aether</span>
              <span className="text-slate-300">Grid</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Platform</Link>
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#use-cases" className="hover:text-primary transition-colors">Use Cases</Link>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="text-sm bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              Get Started Free
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#080c14] border-t border-border/30 px-4 py-4 space-y-3">
            {["Platform", "Features", "Pricing", "Use Cases", "Docs"].map(item => (
              <Link key={item} href={item === "Platform" ? "/dashboard" : `#${item.toLowerCase().replace(" ", "-")}`}
                className="block text-muted-foreground hover:text-primary py-1 transition-colors"
                onClick={() => setMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="text-center py-2 border border-border rounded-lg text-sm">Sign In</Link>
              <Link href="/register" className="text-center py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm text-white">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 rounded-full mb-6">
              <span className="status-dot status-online" />
              Now in public beta — Join 10,000+ developers
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="text-white">Edge AI for</span>
            <br />
            <span className="gradient-text">Every Device</span>
            <br />
            <span className="text-white">on Earth</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy intelligent AI models from $3 ESP32 microcontrollers to NVIDIA GPU clusters.
            Manage billions of IoT devices with real-time analytics, automated workflows, and enterprise security.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.5)]">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 backdrop-blur-sm">
              <Eye className="w-5 h-5" />
              Live Demo
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card", "Free tier forever", "Deploy in 5 minutes"].map((txt, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-400" /> {txt}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero Dashboard Preview */}
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080c14] z-10 pointer-events-none" style={{ top: "60%" }} />
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.1)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-muted/50 text-xs text-muted-foreground px-4 py-1 rounded-full">
                  app.aethergrid.ai/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: "Active Devices", value: "2,847", change: "+12%", color: "cyan", icon: <Cpu className="w-5 h-5" /> },
                { label: "AI Models", value: "34", change: "+3", color: "violet", icon: <Brain className="w-5 h-5" /> },
                { label: "Data/sec", value: "1.2 TB", change: "+5%", color: "green", icon: <Activity className="w-5 h-5" /> },
                { label: "Uptime", value: "99.99%", change: "30d", color: "blue", icon: <Shield className="w-5 h-5" /> },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center text-${stat.color}-400 mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-xs text-green-400 mt-1">{stat.change}</div>
                </div>
              ))}
              {/* Mini chart area */}
              <div className="col-span-3 glass rounded-xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">Device Telemetry — Last 24h</div>
                <div className="flex items-end gap-1 h-16">
                  {[40, 65, 48, 72, 85, 60, 78, 92, 70, 85, 95, 88, 76, 84, 91, 87, 93, 78, 85, 90, 82, 88, 94, 91].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500 to-cyan-300 opacity-80 transition-all"
                      style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">Device Status</div>
                <div className="space-y-2">
                  {[{ l: "Online", v: 78, c: "bg-green-400" }, { l: "Offline", v: 15, c: "bg-slate-500" }, { l: "Warning", v: 7, c: "bg-yellow-400" }].map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{d.l}</span>
                        <span className="text-white">{d.v}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full">
                        <div className={`h-full ${d.c} rounded-full`} style={{ width: `${d.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "1B+", label: "Devices Supported" },
            { value: "50+", label: "AI Model Types" },
            { value: "30+", label: "Export Formats" },
            { value: "99.99%", label: "Uptime SLA" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="text-center">
              <div className="text-3xl sm:text-4xl font-black gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">TRUSTED BY ENGINEERING TEAMS AT</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40">
            {["BOSCH", "SIEMENS", "TESLA", "SAMSUNG", "INTEL", "ARM", "QUALCOMM"].map(name => (
              <span key={name} className="text-lg font-bold tracking-widest text-slate-400">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-3 mb-4">
              Everything you need to<br />
              <span className="gradient-text">run AI at the edge</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete platform from device onboarding to production AI deployment.
              No other tool needed.
            </p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Cpu className="w-6 h-6" />, color: "cyan",
                title: "IoT Device Management",
                desc: "Manage ESP32, Raspberry Pi, NVIDIA Jetson, STM32, RISC-V, and Arduino boards. Real-time status monitoring, OTA firmware updates, remote commands."
              },
              {
                icon: <Brain className="w-6 h-6" />, color: "violet",
                title: "AI/ML Model Hub",
                desc: "Deploy TensorFlow, PyTorch, ONNX, and TFLite models to any hardware. AutoML wizard, model versioning, A/B testing, and live inference playground."
              },
              {
                icon: <Activity className="w-6 h-6" />, color: "green",
                title: "Real-Time Analytics",
                desc: "15+ chart types including line, area, bar, pie, radar, and scatter. Time-range selectors, geographic heatmaps, and anomaly detection built-in."
              },
              {
                icon: <Zap className="w-6 h-6" />, color: "yellow",
                title: "Automation Engine",
                desc: "Visual rule builder with drag-drop conditions and actions. If-this-then-that logic for device commands, notifications, and data transforms."
              },
              {
                icon: <Database className="w-6 h-6" />, color: "blue",
                title: "Export Center (30+ Formats)",
                desc: "CSV, Excel, JSON, Parquet, SQLite, PDF, Protocol Buffers, GeoJSON, KML, and more. Scheduled reports and API streaming support."
              },
              {
                icon: <Shield className="w-6 h-6" />, color: "red",
                title: "Enterprise Security",
                desc: "AES-256 encryption, JWT + refresh tokens, TOTP 2FA, RBAC with 9 roles, audit logs, rate limiting, and CSP security headers."
              },
              {
                icon: <Network className="w-6 h-6" />, color: "cyan",
                title: "Integration Hub",
                desc: "Connect AWS, Azure, GCP, Slack, Discord, Kafka, RabbitMQ, Zapier, and 50+ services. Webhook delivery with retry logic and signing."
              },
              {
                icon: <Globe className="w-6 h-6" />, color: "violet",
                title: "Edge Computing Runtime",
                desc: "Deploy API services, ML serving, web apps, workers, data pipelines, stream processing, and edge functions with auto-scaling."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />, color: "green",
                title: "Team Collaboration",
                desc: "RBAC roles (Owner, Admin, Member, Viewer), shared device groups, team projects, and complete activity audit trails."
              },
            ].map((feat, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass rounded-2xl p-6 glow-border group hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-${feat.color}-500/15 border border-${feat.color}-500/30 flex items-center justify-center text-${feat.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-4 border-y border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/5 to-cyan-900/5" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-3">
              From device to<br />
              <span className="gradient-text">production in minutes</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <Server />, title: "Connect Device", desc: "Register your hardware in seconds. Auto-detect ESP32, Raspberry Pi, Jetson, and more." },
              { step: "02", icon: <Bot />, title: "Upload AI Model", desc: "Drag-drop your TFLite, ONNX, or PyTorch model. We handle optimization automatically." },
              { step: "03", icon: <Rocket />, title: "Deploy to Edge", desc: "One-click deployment with auto-scaling, health checks, and rolling updates." },
              { step: "04", icon: <TrendingUp />, title: "Monitor & Scale", desc: "Real-time analytics, automated alerts, and intelligent auto-scaling at any scale." },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-border/50" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-4xl font-black text-border mb-2">{step.step}</div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Hardware */}
      <section id="use-cases" className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Works on <span className="gradient-text">every platform</span>
            </h2>
            <p className="text-muted-foreground">Full support from microcontrollers to GPU clusters</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "ESP32/8266", proto: "WiFi, BLE, MQTT", icon: "🔌" },
              { name: "Raspberry Pi", proto: "Ethernet, WiFi, LoRa", icon: "🍓" },
              { name: "NVIDIA Jetson", proto: "Ethernet, CUDA, TensorRT", icon: "⚡" },
              { name: "STM32", proto: "CAN, UART, SPI", icon: "🔧" },
              { name: "RISC-V", proto: "Custom protocols", icon: "🖥️" },
              { name: "Arduino", proto: "Serial, I2C, SPI", icon: "🔴" },
            ].map((hw, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 text-center glow-border hover:-translate-y-1 transition-all duration-200">
                <div className="text-3xl mb-2">{hw.icon}</div>
                <div className="font-semibold text-white text-sm">{hw.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{hw.proto}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Pricing</span>
            <h2 className="text-4xl sm:text-5xl font-black mt-3 mb-4">
              Start free, <span className="gradient-text">scale infinitely</span>
            </h2>
            <p className="text-muted-foreground">No credit card required. Upgrade when you need more.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Free", price: "$0", period: "/month",
                desc: "Perfect for hobbyists and small projects",
                features: ["Up to 10 devices", "3 AI models", "7-day data retention", "1 team member", "Community support", "1 GB storage"],
                cta: "Get Started", highlight: false,
              },
              {
                name: "Pro", price: "$49", period: "/month",
                desc: "For professional developers and growing teams",
                features: ["Up to 1,000 devices", "Unlimited AI models", "90-day data retention", "10 team members", "Priority support", "100 GB storage", "Custom webhooks", "API access"],
                cta: "Start Pro Trial", highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "",
                desc: "Unlimited scale for mission-critical deployments",
                features: ["Unlimited devices", "Unlimited everything", "Custom retention", "Unlimited team", "24/7 dedicated support", "Custom storage", "SLA guarantee", "On-premise option", "SSO/SAML"],
                cta: "Contact Sales", highlight: false,
              },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 relative ${plan.highlight
                  ? "bg-gradient-to-b from-cyan-500/10 to-violet-600/10 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,212,255,0.15)]"
                  : "glass glow-border"
                }`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.highlight
                    ? "bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                    : "border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Loved by <span className="gradient-text">developers worldwide</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Chen", role: "Lead IoT Engineer @ Bosch", quote: "AetherGrid cut our device management time by 80%. Deploying AI models to our factory floor is now a one-click operation.", stars: 5 },
              { name: "Marcus Webb", role: "Founder @ EdgeSense Labs", quote: "We went from prototype to production with 5,000 Raspberry Pi devices in under a week. The analytics alone are worth the price.", stars: 5 },
              { name: "Priya Nair", role: "ML Engineer @ Toyota R&D", quote: "The model deployment pipeline is phenomenal. TFLite quantization happens automatically and inference latency dropped by 60%.", stars: 5 },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 glow-border">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative glass rounded-3xl p-16 border border-cyan-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-600/5" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Ready to deploy AI<br />
                <span className="gradient-text">at the edge?</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of engineers building the future of intelligent hardware.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register"
                  className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-10 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-[0_0_40px_rgba(0,212,255,0.4)]">
                  Start Building Free
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-base">
                  View Live Demo <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <CircuitBoard className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">
                  <span className="gradient-text">Aether</span>
                  <span className="text-slate-300">Grid</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                World-Scale Autonomous Edge AI & Hardware OS Ecosystem. Empowering the Edge AI Revolution.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Dashboard", "Devices", "AI Models", "Analytics", "Automations"] },
              { title: "Developers", links: ["Documentation", "API Reference", "SDKs", "Changelog", "Status"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Privacy"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 AetherGrid AI. All rights reserved. MIT License.</p>
            <p className="text-sm text-muted-foreground">Built with ❤️ for the Edge AI Community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
