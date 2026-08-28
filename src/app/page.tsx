"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Cpu, Radio, Brain, Zap, Shield, Globe, BarChart3, Code,
  Check, Star, ArrowRight, Activity, Database, Network, Eye, Rocket,
  CircuitBoard, TrendingUp, Users, Menu, X,
  Cloud, Gauge, Package, Key,
  FlaskConical, LineChart, MonitorDot, Fingerprint,
  ChevronDown, PlayCircle, ExternalLink, BookOpen,
  AlertCircle, CheckCircle2, Workflow, BrainCircuit,
  SlidersHorizontal, Map, FileJson, Twitter, Github, Linkedin
} from "lucide-react";

// ─── Live Network Canvas ──────────────────────────────────────────────────────
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Node = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; pulse: number; pulseSpeed: number;
      type: string;
    };

    const colors = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#06b6d4"];
    const types = ["ESP32", "Jetson", "RPi", "STM32", "Hub"];
    const nodes: Node[] = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: i < 3 ? 7 : 4 + Math.random() * 3,
      color: colors[i % colors.length],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
      type: types[i % types.length],
    }));

    type Packet = { fromIdx: number; toIdx: number; t: number; speed: number; color: string };
    const packets: Packet[] = [];
    let frame = 0;

    const LINK_DIST = 180;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Spawn packets
      if (frame % 30 === 0 && packets.length < 25) {
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        while (b === a) b = Math.floor(Math.random() * nodes.length);
        packets.push({ fromIdx: a, toIdx: b, t: 0, speed: 0.008 + Math.random() * 0.012, color: colors[Math.floor(Math.random() * colors.length)] });
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const from = nodes[p.fromIdx];
        const to = nodes[p.toIdx];
        const px = from.x + (to.x - from.x) * p.t;
        const py = from.y + (to.y - from.y) * p.t;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.pulse += n.pulseSpeed;
        const glow = 0.5 + 0.5 * Math.sin(n.pulse);

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4 + glow * 4, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}10`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 12 + glow * 8;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(Math.floor(ease * to));
      if (prog < 1) requestAnimationFrame(step);
      else setVal(to);
    };
    requestAnimationFrame(step);
  }, [inView, to]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────
const tickerItems = [
  "🟢 2,847 devices online",
  "⚡ 1.2 TB data/sec",
  "🧠 34 models deployed",
  "📡 128 regions active",
  "🔒 99.99% uptime",
  "🚀 ESP32 → NVIDIA Jetson",
  "💡 8ms edge inference",
  "🌐 50+ ML frameworks",
  "📊 Real-time analytics",
  "🔄 Auto-OTA updates",
];

function LiveTicker() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500/10 via-violet-600/10 to-cyan-500/10 border-y border-cyan-500/20 py-3">
      <div className="flex animate-ticker gap-12 whitespace-nowrap">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="text-xs font-mono text-cyan-400/80 shrink-0">{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl border border-border/50 bg-[#0a0e1a] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/10">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
        <button onClick={copy} className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors flex items-center gap-1.5">
          {copied ? <><CheckCircle2 className="w-3 h-3 text-green-400" /> Copied!</> : <><Code className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: code }} />
      </pre>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub }: { tag: string; title: React.ReactNode; sub: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 rounded-full mb-5">
        {tag}
      </span>
      <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">{sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manufacturing");
  const [activePricing, setActivePricing] = useState<"monthly" | "annual">("annual");
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(8,12,20,0)", "rgba(8,12,20,0.95)"]);

  const navLinks = [
    { label: "Platform", href: "/dashboard" },
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "/docs" },
  ];

  const features = [
    { icon: <Cpu className="w-5 h-5" />, title: "Multi-Device Support", desc: "ESP32, Jetson, RPi, STM32, RISC-V, Arduino and custom hardware — all under one control plane.", color: "cyan" },
    { icon: <Brain className="w-5 h-5" />, title: "AI Model Registry", desc: "Version-controlled model store with TFLite, ONNX, PyTorch, OpenVINO support and one-click edge deployment.", color: "violet" },
    { icon: <Radio className="w-5 h-5" />, title: "Real-Time Telemetry", desc: "Sub-100ms sensor data streaming with WebSocket live feeds, anomaly alerts, and historical queries.", color: "emerald" },
    { icon: <Zap className="w-5 h-5" />, title: "OTA Updates at Scale", desc: "Atomic firmware updates across thousands of devices with rollback, A/B staging, and canary deployments.", color: "amber" },
    { icon: <Shield className="w-5 h-5" />, title: "Zero-Trust Security", desc: "Per-device PKI certificates, encrypted channels, audit trails, and RBAC access control built in.", color: "rose" },
    { icon: <BarChart3 className="w-5 h-5" />, title: "Advanced Analytics", desc: "Edge-to-cloud data pipelines with time-series aggregation, anomaly detection, and custom dashboards.", color: "sky" },
    { icon: <Workflow className="w-5 h-5" />, title: "Automation Engine", desc: "IFTTT-style rule chains, scheduled jobs, and event-driven webhooks with conditional logic.", color: "purple" },
    { icon: <FileJson className="w-5 h-5" />, title: "Export Anywhere", desc: "One-click export to CSV, JSON, Parquet, PDF reports with email delivery via Resend.", color: "teal" },
    { icon: <Globe className="w-5 h-5" />, title: "Multi-Region Deploy", desc: "Edge functions across 128+ regions with automatic failover and intelligent traffic routing.", color: "indigo" },
    { icon: <BrainCircuit className="w-5 h-5" />, title: "MLOps Pipeline", desc: "End-to-end training → evaluation → deployment → monitoring with drift detection.", color: "fuchsia" },
    { icon: <Key className="w-5 h-5" />, title: "API-First Design", desc: "Full REST + WebSocket API with SDKs for Python, Node.js, Go. GraphQL endpoint coming soon.", color: "orange" },
    { icon: <Users className="w-5 h-5" />, title: "Team Collaboration", desc: "Shared workspaces, role management, activity feeds, and live collaborative editing.", color: "green" },
  ];

  const hardwareItems = [
    { name: "ESP32", spec: "Dual-core 240MHz", power: "0.01W", icon: "🔌" },
    { name: "ESP8266", spec: "80/160MHz", power: "0.01W", icon: "📡" },
    { name: "NVIDIA Jetson", spec: "GPU-accelerated", power: "10-15W", icon: "🖥️" },
    { name: "Raspberry Pi", spec: "Quad-core ARM", power: "3-7W", icon: "🍓" },
    { name: "STM32", spec: "Cortex-M4", power: "0.001W", icon: "⚡" },
    { name: "RISC-V", spec: "Open ISA", power: "Custom", icon: "🔬" },
    { name: "Arduino", spec: "AVR/ARM", power: "0.02W", icon: "🤖" },
    { name: "Custom", spec: "Any Linux SBC", power: "Varies", icon: "🛠️" },
  ];

  const mlFrameworks = [
    { name: "TensorFlow Lite", badge: "Edge", color: "orange" },
    { name: "PyTorch", badge: "Training", color: "red" },
    { name: "ONNX Runtime", badge: "Cross-platform", color: "blue" },
    { name: "OpenVINO", badge: "Intel", color: "sky" },
    { name: "TensorRT", badge: "NVIDIA", color: "green" },
    { name: "CoreML", badge: "Apple", color: "gray" },
  ];

  const useCases = {
    manufacturing: {
      title: "Smart Manufacturing",
      kpis: ["↓ 34% defect rate", "↑ 22% throughput", "↓ 67% downtime"],
      steps: [
        { icon: <Cpu className="w-4 h-4" />, text: "Vision sensors on each production line" },
        { icon: <Brain className="w-4 h-4" />, text: "YOLOv8 model detects defects at 94.2% accuracy" },
        { icon: <Zap className="w-4 h-4" />, text: "Actuator triggers auto-reject in <10ms" },
        { icon: <BarChart3 className="w-4 h-4" />, text: "Real-time quality dashboard with trend alerts" },
      ],
    },
    cities: {
      title: "Smart Cities",
      kpis: ["↓ 41% energy waste", "↑ 89% sensor uptime", "5-yr ROI proven"],
      steps: [
        { icon: <Radio className="w-4 h-4" />, text: "10,000+ IoT sensors city-wide mesh" },
        { icon: <LineChart className="w-4 h-4" />, text: "Predictive traffic & air quality models" },
        { icon: <Shield className="w-4 h-4" />, text: "Anomaly detection for infrastructure" },
        { icon: <Globe className="w-4 h-4" />, text: "Open data API for civic integration" },
      ],
    },
    healthcare: {
      title: "Healthcare IoT",
      kpis: ["HIPAA compliant", "99.99% uptime", "<5ms response"],
      steps: [
        { icon: <Activity className="w-4 h-4" />, text: "Patient vitals monitoring at the edge" },
        { icon: <Fingerprint className="w-4 h-4" />, text: "Encrypted transmission to EHR systems" },
        { icon: <AlertCircle className="w-4 h-4" />, text: "ML-powered early deterioration alerts" },
        { icon: <CheckCircle2 className="w-4 h-4" />, text: "Compliance audit trails auto-generated" },
      ],
    },
    retail: {
      title: "Retail & Logistics",
      kpis: ["↑ 28% sales lift", "↓ 44% shrinkage", "Real-time inventory"],
      steps: [
        { icon: <Eye className="w-4 h-4" />, text: "Computer vision for shelf analytics" },
        { icon: <Map className="w-4 h-4" />, text: "Indoor positioning for asset tracking" },
        { icon: <Package className="w-4 h-4" />, text: "Automated reorder triggers via API" },
        { icon: <TrendingUp className="w-4 h-4" />, text: "Demand forecasting models at each site" },
      ],
    },
  };

  const pipelineSteps = [
    { icon: <Database className="w-5 h-5" />, title: "Ingest", desc: "Connect sensors, upload datasets, or stream MQTT/HTTP data" },
    { icon: <SlidersHorizontal className="w-5 h-5" />, title: "Preprocess", desc: "Automated feature engineering, normalization, augmentation" },
    { icon: <FlaskConical className="w-5 h-5" />, title: "Train", desc: "Launch training jobs with GPU clusters or CPU queues" },
    { icon: <Gauge className="w-5 h-5" />, title: "Evaluate", desc: "Auto-benchmark accuracy, latency, memory footprint" },
    { icon: <Rocket className="w-5 h-5" />, title: "Deploy", desc: "Push to any device type in one click with rollback" },
    { icon: <MonitorDot className="w-5 h-5" />, title: "Monitor", desc: "Live inference metrics, drift detection, auto-retrain triggers" },
  ];

  const pricing = [
    {
      name: "Free", price: activePricing === "annual" ? "$0" : "$0", desc: "For makers and hobbyists",
      features: ["Up to 10 devices", "3 AI models", "1GB telemetry/mo", "Community support", "REST API access", "Basic analytics"],
      cta: "Start Free", href: "/register", highlight: false,
    },
    {
      name: "Pro", price: activePricing === "annual" ? "$49" : "$59", desc: "For professional teams",
      features: ["Up to 1,000 devices", "Unlimited AI models", "100GB telemetry/mo", "Priority support", "Full API + webhooks", "Advanced analytics", "OTA updates", "Team collaboration"],
      cta: "Start Pro Trial", href: "/register", highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", desc: "For large-scale deployments",
      features: ["Unlimited devices", "Custom SLA", "Dedicated infra", "24/7 support", "SSO + SAML", "Compliance reports", "On-prem option", "White-label"],
      cta: "Contact Sales", href: "mailto:sales@aethergrid.ai", highlight: false,
    },
  ];

  const testimonials = [
    { name: "Arjun Mehta", role: "CTO @ IndustrialIQ", text: "Replaced 3 separate tools with AetherGrid. Our edge deployment cycle went from 2 weeks to 4 hours.", avatar: "AM" },
    { name: "Sarah Chen", role: "ML Engineer @ NeuraTech", text: "The ONNX export and one-click device push is genuinely impressive. We're running 94% accuracy on ESP32.", avatar: "SC" },
    { name: "Marcus Webb", role: "VP Eng @ SmartCity Labs", text: "Managing 50,000 sensors used to be chaos. AetherGrid's group OTA and live telemetry saved us.", avatar: "MW" },
    { name: "Priya Nair", role: "IoT Lead @ MedEdge", text: "HIPAA compliance built-in, audit trails automatic. AetherGrid is the only platform we trusted for healthcare.", avatar: "PN" },
    { name: "Tom Rivera", role: "Founder @ AgriSense", text: "Running TFLite soil models on $4 microcontrollers across 200 farms. ROI in month one.", avatar: "TR" },
    { name: "Lin Zhang", role: "Staff Eng @ RetailOS", text: "The analytics pipelines and export features saved our data science team 20 hours per week.", avatar: "LZ" },
  ];

  const integrations = [
    "MQTT", "gRPC", "WebSocket", "REST API", "Kafka", "NATS",
    "PostgreSQL", "TimescaleDB", "InfluxDB", "Redis", "S3", "GCS",
    "TensorFlow", "PyTorch", "ONNX", "Grafana", "Prometheus", "Datadog",
  ];

  const apiCode = `<span class="text-violet-400">import</span> <span class="text-cyan-300">aethergrid</span> <span class="text-violet-400">from</span> <span class="text-green-300">'@aethergrid/sdk'</span>;

<span class="text-slate-400">// Initialize client</span>
<span class="text-violet-400">const</span> <span class="text-cyan-300">ag</span> = <span class="text-violet-400">new</span> <span class="text-cyan-300">aethergrid</span>({ apiKey: <span class="text-green-300">'ag_live_xxx'</span> });

<span class="text-slate-400">// Deploy model to device fleet</span>
<span class="text-violet-400">const</span> <span class="text-cyan-300">deploy</span> = <span class="text-violet-400">await</span> ag.models.deploy({
  modelId: <span class="text-green-300">'model_yolov8_edge'</span>,
  targets: { group: <span class="text-green-300">'warehouse-fleet'</span> },
  strategy: <span class="text-green-300">'canary'</span>,
  canaryPercent: <span class="text-amber-300">10</span>,
});

<span class="text-slate-400">// Stream live telemetry</span>
ag.devices.stream(<span class="text-green-300">'dev_esp32_01'</span>)
  .on(<span class="text-green-300">'reading'</span>, ({ metric, value }) => {
    console.log(<span class="text-green-300">\`\${metric}: \${value}\`</span>);
  });`;

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 cyber-grid opacity-25" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-cyan-500/4 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[800px] h-[500px] bg-violet-600/4 blur-[160px] rounded-full" />
      </div>

      {/* ── Navbar ── */}
      <motion.nav style={{ backgroundColor: navBg }} className="fixed top-0 inset-x-0 z-50 border-b border-border/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <CircuitBoard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-base tracking-tight">
              <span className="gradient-text">Aether</span><span className="text-slate-300">Grid</span>
              <span className="ml-1.5 text-[9px] font-mono text-cyan-500 border border-cyan-500/40 px-1.5 py-0.5 rounded align-middle">AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            {navLinks.map(l => (
              <Link key={l.label} href={l.href} className="hover:text-cyan-400 transition-colors font-medium">{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3.5 py-2 rounded-lg hover:bg-muted/30">
              Sign In
            </Link>
            <Link href="/register" className="text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(0,212,255,0.25)]">
              Get Started Free →
            </Link>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted/30" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-[#060a14] border-t border-border/20 px-4 py-5 space-y-1">
              {navLinks.map(l => (
                <Link key={l.label} href={l.href} className="block text-sm text-muted-foreground hover:text-cyan-400 py-2.5 px-3 rounded-lg hover:bg-muted/20 transition-all" onClick={() => setMenuOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 grid grid-cols-2 gap-2">
                <Link href="/login" className="text-center py-2.5 border border-border/60 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/register" className="text-center py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-semibold text-white" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 px-4 min-h-[92vh] flex flex-col justify-center overflow-hidden">
        <NetworkCanvas />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Now in public beta · 10,000+ developers worldwide
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.92] mb-7">
              <span className="text-white">The Edge AI Platform</span>
              <br />
              <span className="gradient-text">for Every Device on Earth</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Deploy, monitor, and scale AI models from <span className="text-cyan-400 font-mono">$3 ESP32 microcontrollers</span> to <span className="text-violet-400 font-mono">NVIDIA GPU clusters</span>. One unified platform for the entire edge AI lifecycle.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              <Link href="/register" className="group flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.5)]">
                <Rocket className="w-4 h-4" />
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2.5 border border-border/60 hover:border-cyan-400/40 text-muted-foreground hover:text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all backdrop-blur-sm hover:bg-white/5">
                <PlayCircle className="w-4 h-4" />
                Live Demo
              </Link>
              <Link href="/docs" className="flex items-center gap-2.5 text-muted-foreground hover:text-cyan-400 px-4 py-3.5 rounded-xl font-medium text-sm transition-all">
                <BookOpen className="w-4 h-4" />
                Docs
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center justify-center gap-5 text-xs text-muted-foreground flex-wrap">
              {["No credit card", "Free tier forever", "Deploy in 5 minutes", "Open API"].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400" /> {t}</span>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-5xl mx-auto mt-16 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-600/20 to-cyan-500/20 blur-xl rounded-3xl opacity-60" />
            <div className="relative rounded-2xl border border-border/40 bg-[#080c16]/80 backdrop-blur overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.08)]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30 bg-muted/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted/40 text-[10px] text-muted-foreground px-4 py-1 rounded-full font-mono">
                    app.aethergrid.ai/dashboard
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              {/* Stats grid */}
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Active Devices", value: "2,847", change: "+12.3%", color: "cyan", icon: <Cpu className="w-4 h-4" /> },
                  { label: "AI Models Live", value: "34", change: "+3 today", color: "violet", icon: <Brain className="w-4 h-4" /> },
                  { label: "Data / sec", value: "1.2 TB", change: "↑ 5.1%", color: "emerald", icon: <Activity className="w-4 h-4" /> },
                  { label: "Uptime", value: "99.99%", change: "30-day avg", color: "sky", icon: <Shield className="w-4 h-4" /> },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }}
                    className="glass rounded-xl p-3.5">
                    <div className={`text-${s.color}-400 mb-2.5`}>{s.icon}</div>
                    <div className="text-xl font-black text-white mb-0.5">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground">{s.label}</div>
                    <div className="text-[10px] text-green-400 mt-1 font-mono">{s.change}</div>
                  </motion.div>
                ))}
              </div>
              {/* Chart area */}
              <div className="px-5 pb-5 grid grid-cols-3 gap-3">
                <div className="col-span-2 glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Device Telemetry — Last 24h</span>
                    <span className="text-[10px] text-green-400 font-mono">LIVE</span>
                  </div>
                  <div className="flex items-end gap-0.5 h-14">
                    {[40,55,48,62,78,65,82,90,74,88,95,91,85,79,88,93,87,92,85,90,88,94,91,96].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500 to-cyan-300/80 opacity-80"
                        style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">Status</div>
                  <div className="space-y-2.5">
                    {[{ l: "Online", v: 78, c: "bg-green-400" }, { l: "Offline", v: 15, c: "bg-slate-500" }, { l: "Warning", v: 7, c: "bg-amber-400" }].map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">{d.l}</span>
                          <span className="text-white font-mono">{d.v}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full">
                          <div className={`h-full ${d.c} rounded-full transition-all duration-1000`} style={{ width: `${d.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50 animate-bounce">
          <span className="text-[10px] font-mono">SCROLL</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ── Live Ticker ── */}
      <LiveTicker />

      {/* ── Stats ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: 1000000000, suf: "B+", label: "Devices Supported", pre: "" },
            { val: 50, suf: "+", label: "ML Frameworks", pre: "" },
            { val: 128, suf: "+", label: "Global Regions", pre: "" },
            { val: 9999, suf: "%", label: "Uptime SLA", pre: "99." },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">
                {s.pre}<Counter to={s.pre === "99." ? 99 : s.val} suffix={s.suf} />
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            tag="⚡ PLATFORM CAPABILITIES"
            title={<>Everything you need for<br /><span className="gradient-text">production edge AI</span></>}
            sub="A unified control plane for hardware, models, data, and automation — from prototype to planet-scale."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 hover:border-cyan-400/30 transition-all group cursor-default glow-border">
                <div className={`w-9 h-9 rounded-xl bg-${f.color}-500/15 flex items-center justify-center text-${f.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm text-white mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section id="architecture" className="py-24 px-4 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="🏗️ ARCHITECTURE"
            title={<>Full-stack edge AI<br /><span className="gradient-text">from silicon to cloud</span></>}
            sub="A layered architecture designed for reliability, security, and infinite scale."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Architecture diagram */}
            <div className="space-y-2">
              {[
                { label: "DEVICE LAYER", items: ["ESP32", "Jetson", "RPi", "STM32"], color: "cyan", icon: <Cpu className="w-3.5 h-3.5" /> },
                { label: "CONNECTIVITY LAYER", items: ["MQTT", "gRPC", "WebSocket", "HTTP/2"], color: "violet", icon: <Radio className="w-3.5 h-3.5" /> },
                { label: "EDGE GATEWAY", items: ["OTA Manager", "Security Hub", "Data Broker"], color: "emerald", icon: <Network className="w-3.5 h-3.5" /> },
                { label: "PLATFORM CORE", items: ["AetherGrid API", "ML Registry", "Analytics"], color: "amber", icon: <Brain className="w-3.5 h-3.5" /> },
                { label: "CLOUD & STORAGE", items: ["Neon PG", "S3/GCS", "Vercel Edge"], color: "sky", icon: <Cloud className="w-3.5 h-3.5" /> },
              ].map((layer, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border border-${layer.color}-500/20 bg-${layer.color}-500/5`}>
                  <div className={`w-8 h-8 rounded-lg bg-${layer.color}-500/20 flex items-center justify-center text-${layer.color}-400 shrink-0`}>
                    {layer.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-mono text-${layer.color}-400 mb-1`}>{layer.label}</div>
                    <div className="flex gap-2 flex-wrap">
                      {layer.items.map((item, j) => (
                        <span key={j} className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded font-mono">{item}</span>
                      ))}
                    </div>
                  </div>
                  {i < 4 && <div className={`w-px h-full border-l border-dashed border-${layer.color}-500/30`} />}
                </motion.div>
              ))}
            </div>
            {/* ML Frameworks */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white">Supported ML Frameworks</h3>
              <div className="grid grid-cols-2 gap-3">
                {mlFrameworks.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="glass rounded-xl p-4 flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{f.name}</span>
                    <span className={`text-[10px] font-mono text-${f.color}-400 border border-${f.color}-400/30 px-2 py-0.5 rounded-full`}>{f.badge}</span>
                  </motion.div>
                ))}
              </div>
              <div className="glass rounded-xl p-5">
                <div className="text-xs text-muted-foreground mb-3 font-mono">MODEL INFERENCE BENCHMARK (ESP32)</div>
                {[{ name: "TFLite INT8", ms: 28, pct: 100 }, { name: "ONNX Runtime", ms: 45, pct: 62 }, { name: "Custom C++ Runtime", ms: 12, pct: 42 }].map((b, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{b.name}</span>
                      <span className="font-mono text-cyan-400">{b.ms}ms</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${b.pct}%` }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hardware Support ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="🔌 HARDWARE"
            title={<>From <span className="gradient-text">$3 microcontrollers</span><br />to GPU clusters</>}
            sub="Native SDK support for every major embedded and edge computing platform."
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {hardwareItems.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 text-center hover:border-cyan-400/30 transition-all glow-border group">
                <div className="text-3xl mb-3">{h.icon}</div>
                <div className="font-bold text-sm text-white mb-1">{h.name}</div>
                <div className="text-[11px] text-muted-foreground mb-1">{h.spec}</div>
                <div className="text-[10px] font-mono text-cyan-400">{h.power}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ML Pipeline ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="🧠 ML LIFECYCLE"
            title={<>Full MLOps pipeline,<br /><span className="gradient-text">built for edge</span></>}
            sub="Every stage from raw data ingestion to live edge inference — automated, monitored, and reproducible."
          />
          <div className="relative">
            <div className="absolute top-10 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent hidden lg:block" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {pipelineSteps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 z-10">
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 mb-1.5">0{i + 1}</div>
                  <div className="font-bold text-sm text-white mb-1.5">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── API Quick Start ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="⌨️ DEVELOPER FIRST"
            title={<>Deploy in <span className="gradient-text">minutes</span>,<br />not months</>}
            sub="Intuitive SDK with full TypeScript types. REST, WebSocket, and GraphQL APIs."
          />
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <div className="space-y-3">
                {[
                  { n: "1", t: "Install SDK", c: "npm install @aethergrid/sdk" },
                  { n: "2", t: "Init client", c: 'const ag = new AetherGrid({ apiKey: "ag_live_..." })' },
                  { n: "3", t: "Deploy model", c: "await ag.models.deploy({ modelId, targets })" },
                  { n: "4", t: "Stream telemetry", c: 'ag.devices.stream("dev_01").on("reading", cb)' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/30 border border-cyan-500/40 flex items-center justify-center text-[10px] font-mono text-cyan-400 shrink-0 mt-0.5">{step.n}</div>
                    <div>
                      <div className="text-xs font-semibold text-white mb-1">{step.t}</div>
                      <code className="text-[11px] font-mono text-cyan-400/80 bg-cyan-400/5 border border-cyan-400/20 px-2.5 py-1 rounded block">{step.c}</code>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/docs" className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Full Documentation
                </Link>
                <Link href="/register" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
                  <Key className="w-3.5 h-3.5" /> Get API Key
                </Link>
              </div>
            </div>
            <CodeBlock code={apiCode} lang="TypeScript — aethergrid-sdk" />
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section id="use-cases" className="py-24 px-4 bg-gradient-to-b from-transparent via-cyan-950/8 to-transparent">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="🌍 USE CASES"
            title={<>Built for every <span className="gradient-text">vertical</span></>}
            sub="Real deployments across manufacturing, smart cities, healthcare, retail, and beyond."
          />
          <div className="flex gap-2 flex-wrap justify-center mb-10">
            {Object.entries(useCases).map(([key, uc]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]" : "border border-border/60 text-muted-foreground hover:text-white hover:border-cyan-400/30"}`}>
                {uc.title}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="glass rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    {useCases[activeTab as keyof typeof useCases].kpis.map((kpi, i) => (
                      <span key={i} className="text-xs font-mono text-green-400 border border-green-400/30 bg-green-400/5 px-3 py-1.5 rounded-full">{kpi}</span>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {useCases[activeTab as keyof typeof useCases].steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">{step.icon}</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-5">
                    <div className="text-xs font-mono text-muted-foreground mb-3">LIVE DEVICE METRICS</div>
                    {[{ label: "Inference/sec", val: "1,240", unit: "ops", color: "cyan" }, { label: "Avg latency", val: "8.4", unit: "ms", color: "violet" }, { label: "Model accuracy", val: "94.2", unit: "%", color: "green" }].map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <span className={`text-sm font-black text-${m.color}-400 font-mono`}>{m.val}<span className="text-[10px] text-muted-foreground ml-1">{m.unit}</span></span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500/20 to-violet-600/20 hover:from-cyan-500/30 hover:to-violet-600/30 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl text-sm font-semibold transition-all">
                    See full case study <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="🔗 INTEGRATIONS"
            title={<>Connects to your<br /><span className="gradient-text">entire stack</span></>}
            sub="Plug in to every protocol, database, and observability tool you already use."
          />
          <div className="flex flex-wrap gap-3 justify-center">
            {integrations.map((name, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="text-xs font-mono text-muted-foreground border border-border/50 bg-muted/20 hover:border-cyan-400/40 hover:text-cyan-400 px-4 py-2 rounded-lg transition-all cursor-default">
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/8 to-transparent">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            tag="💳 PRICING"
            title={<>Simple, transparent<br /><span className="gradient-text">pricing</span></>}
            sub="Start free, scale when youyou're readyapos;re ready. No hidden fees, no vendor lock-in."
          />
          <div className="flex justify-center gap-2 mb-10">
            {(["monthly", "annual"] as const).map((p) => (
              <button key={p} onClick={() => setActivePricing(p)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activePricing === p ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white" : "border border-border/60 text-muted-foreground"}`}>
                {p === "monthly" ? "Monthly" : "Annual (save 20%)"}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {pricing.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 ${plan.highlight ? "bg-gradient-to-b from-cyan-500/10 to-violet-600/10 border border-cyan-500/40 shadow-[0_0_40px_rgba(0,212,255,0.12)]" : "glass"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm font-bold text-muted-foreground mb-1">{plan.name}</div>
                  <div className="text-4xl font-black text-white mb-1">{plan.price}<span className="text-base font-normal text-muted-foreground">{plan.price !== "Custom" ? "/mo" : ""}</span></div>
                  <div className="text-xs text-muted-foreground">{plan.desc}</div>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${plan.highlight ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500 shadow-[0_0_20px_rgba(0,212,255,0.25)]" : "border border-border/60 hover:border-cyan-400/40 text-muted-foreground hover:text-white"}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="💬 TESTIMONIALS"
            title={<>Trusted by engineers<br /><span className="gradient-text">building the future</span></>}
            sub="From solo makers to Fortune 500 edge deployments."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 glow-border">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <div className="text-xs font-semibold text-white">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-violet-600/15 to-cyan-500/15 rounded-3xl border border-cyan-500/25" />
            <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-cyan-500/8 to-violet-600/8" />
            <div className="relative z-10">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
                Ready to build the<br /><span className="gradient-text">edge AI future?</span>
              </h2>
              <p className="text-muted-foreground text-base mb-8 max-w-lg mx-auto">
                Join 10,000+ engineers deploying AI to edge devices. Free tier, no credit card.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                  <Rocket className="w-4 h-4" /> Start Building Free
                </Link>
                <Link href="/docs" className="inline-flex items-center justify-center gap-2 border border-border/60 hover:border-cyan-400/30 text-muted-foreground hover:text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all">
                  <BookOpen className="w-4 h-4" /> Read the Docs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/20 bg-[#040810]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <CircuitBoard className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-black text-base"><span className="gradient-text">Aether</span><span className="text-slate-300">Grid</span></span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-[200px]">
                The world&apos;s most capable edge AI platform. From $3 chips to GPU clusters.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/ShaikMuzzammil" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-white hover:border-cyan-400/40 transition-all">
                  <Github className="w-3.5 h-3.5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-white hover:border-cyan-400/40 transition-all">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-white hover:border-cyan-400/40 transition-all">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            {/* Links */}
            {[
              {
                title: "Platform", links: [
                  { label: "Dashboard", href: "/dashboard" }, { label: "Devices", href: "/devices" },
                  { label: "AI Models", href: "/ai-models" }, { label: "Deployments", href: "/deployments" },
                  { label: "Analytics", href: "/analytics" },
                ]
              },
              {
                title: "Developers", links: [
                  { label: "Documentation", href: "/docs" }, { label: "API Reference", href: "/docs#api" },
                  { label: "SDK", href: "/docs#sdk" }, { label: "Examples", href: "/docs#examples" },
                  { label: "Changelog", href: "/docs#changelog" },
                ]
              },
              {
                title: "Company", links: [
                  { label: "About", href: "#" }, { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" }, { label: "Contact", href: "mailto:hello@aethergrid.ai" },
                  { label: "Status", href: "#" },
                ]
              },
              {
                title: "Legal", links: [
                  { label: "Terms of Service", href: "/legal/terms" }, { label: "Privacy Policy", href: "/legal/privacy" },
                  { label: "Cookie Policy", href: "/legal/cookies" }, { label: "GDPR", href: "/legal/gdpr" },
                ]
              },
            ].map((group, i) => (
              <div key={i}>
                <div className="text-xs font-bold text-white uppercase tracking-widest mb-4">{group.title}</div>
                <ul className="space-y-2.5">
                  {group.links.map((l, j) => (
                    <li key={j}>
                      <Link href={l.href} className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 AetherGrid AI. Built by{" "}
              <a href="https://linktr.ee/Shaik_Muzzammil" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Shaik Muzzammil</a>.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              All systems operational · 99.99% uptime
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
