"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Cpu, Radio, Brain, Zap, Shield, Globe, BarChart3, Code,
  Check, Star, ArrowRight, Activity, Database, Network, Eye, Rocket,
  CircuitBoard, TrendingUp, Users, Menu, X,
  Cloud, Gauge, Package, Key,
  FlaskConical, LineChart, MonitorDot, Fingerprint,
  ChevronDown, PlayCircle, ExternalLink, BookOpen,
  AlertCircle, CheckCircle2, Workflow, BrainCircuit,
  SlidersHorizontal, Map, FileJson, Twitter, Github, Linkedin,
  Server, Layers, GitBranch, Terminal, Cpu as CpuIcon
} from "lucide-react";

// ─── Enhanced Real-Time Network Canvas ────────────────────────────────────────
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", () => { mouseRef.current = { x: -9999, y: -9999 }; });

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    type NodeType = { label: string; color: string; glow: string };
    const NODE_TYPES: NodeType[] = [
      { label: "ESP32",   color: "#00d4ff", glow: "rgba(0,212,255," },
      { label: "Jetson",  color: "#7c3aed", glow: "rgba(124,58,237," },
      { label: "RPi",     color: "#10b981", glow: "rgba(16,185,129," },
      { label: "STM32",   color: "#f59e0b", glow: "rgba(245,158,11," },
      { label: "Hub",     color: "#ec4899", glow: "rgba(236,72,153," },
      { label: "Edge",    color: "#06b6d4", glow: "rgba(6,182,212," },
    ];

    type Node = {
      x: number; y: number; vx: number; vy: number;
      r: number; type: NodeType; pulse: number; pulseSpeed: number;
      ring: number; ringSpeed: number; isHub: boolean;
      dataRate: number; load: number;
    };

    const nodes: Node[] = Array.from({ length: 42 }, (_, i) => {
      const t = NODE_TYPES[i % NODE_TYPES.length];
      const isHub = i < 5;
      return {
        x: Math.random() * W(), y: Math.random() * H(),
        vx: (Math.random() - 0.5) * (isHub ? 0.2 : 0.5),
        vy: (Math.random() - 0.5) * (isHub ? 0.2 : 0.5),
        r: isHub ? 9 : 4 + Math.random() * 4,
        type: t, pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        ring: 0, ringSpeed: 0.008 + Math.random() * 0.012,
        isHub, dataRate: 80 + Math.random() * 920,
        load: Math.random(),
      };
    });

    type Packet = {
      fromIdx: number; toIdx: number; t: number; speed: number;
      color: string; size: number; trail: Array<{ x: number; y: number }>;
    };
    const packets: Packet[] = [];
    let frame = 0;
    const LINK_DIST = 200;
    const HUB_DIST  = 320;

    function spawnPacket() {
      if (packets.length >= 35) return;
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      while (b === a) b = Math.floor(Math.random() * nodes.length);
      const dist = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      const maxD = nodes[a].isHub || nodes[b].isHub ? HUB_DIST : LINK_DIST;
      if (dist > maxD) return;
      packets.push({
        fromIdx: a, toIdx: b, t: 0,
        speed: 0.005 + Math.random() * 0.012,
        color: nodes[a].type.color,
        size: 2 + Math.random() * 2,
        trail: [],
      });
    }

    function drawGlowCircle(x: number, y: number, r: number, color: string, alpha: number) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      g.addColorStop(0, color.replace(")", `,${alpha})`).replace("rgb", "rgba"));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const draw = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      frame++;

      // Spawn packets
      if (frame % 18 === 0) spawnPacket();

      // Move nodes
      nodes.forEach(n => {
        // Mouse repulsion
        const dx = n.x - mouseRef.current.x;
        const dy = n.y - mouseRef.current.y;
        const d  = Math.hypot(dx, dy);
        if (d < 120 && d > 0) {
          n.vx += (dx / d) * 0.4;
          n.vy += (dy / d) * 0.4;
        }
        n.vx *= 0.98; n.vy *= 0.98;
        n.x  += n.vx; n.y  += n.vy;
        if (n.x < n.r)     { n.x = n.r;     n.vx *= -1; }
        if (n.x > w - n.r) { n.x = w - n.r; n.vx *= -1; }
        if (n.y < n.r)     { n.y = n.r;     n.vy *= -1; }
        if (n.y > h - n.r) { n.y = h - n.r; n.vy *= -1; }
        n.pulse += n.pulseSpeed;
        n.ring  = (n.ring + n.ringSpeed) % 1;
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ni = nodes[i], nj = nodes[j];
          const dx = ni.x - nj.x, dy = ni.y - nj.y;
          const dist = Math.hypot(dx, dy);
          const maxD = ni.isHub || nj.isHub ? HUB_DIST : LINK_DIST;
          if (dist > maxD) continue;

          const alpha = (1 - dist / maxD) * (ni.isHub || nj.isHub ? 0.35 : 0.18);
          const grad  = ctx.createLinearGradient(ni.x, ni.y, nj.x, nj.y);
          grad.addColorStop(0, ni.type.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
          grad.addColorStop(1, nj.type.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
          ctx.strokeStyle = grad;
          ctx.lineWidth   = ni.isHub || nj.isHub ? 1.2 : 0.7;
          ctx.beginPath();
          ctx.moveTo(ni.x, ni.y);
          ctx.lineTo(nj.x, nj.y);
          ctx.stroke();
        }
      }

      // Draw packets + trails
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }

        const fn = nodes[p.fromIdx], tn = nodes[p.toIdx];
        const px = fn.x + (tn.x - fn.x) * p.t;
        const py = fn.y + (tn.y - fn.y) * p.t;

        // Trail
        p.trail.push({ x: px, y: py });
        if (p.trail.length > 12) p.trail.shift();
        for (let k = 0; k < p.trail.length - 1; k++) {
          const a = (k / p.trail.length) * 0.7;
          ctx.strokeStyle = p.color + Math.round(a * 255).toString(16).padStart(2, "0");
          ctx.lineWidth   = p.size * (k / p.trail.length);
          ctx.beginPath();
          ctx.moveTo(p.trail[k].x, p.trail[k].y);
          ctx.lineTo(p.trail[k + 1].x, p.trail[k + 1].y);
          ctx.stroke();
        }

        // Packet dot with glow
        const gl = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        gl.addColorStop(0, p.color + "ff");
        gl.addColorStop(0.4, p.color + "88");
        gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulse);

        // Glow halo
        const glowR = n.r * (n.isHub ? 5 : 3.5);
        const glow  = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        glow.addColorStop(0, n.type.glow + (pulse * 0.35) + ")");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Expanding ring for hub nodes
        if (n.isHub) {
          const ringR = n.r + n.ring * 30;
          const ringA = (1 - n.ring) * 0.5;
          ctx.strokeStyle = n.type.glow + ringA + ")";
          ctx.lineWidth   = 1.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node circle
        const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 0, n.x, n.y, n.r);
        grad.addColorStop(0, "#ffffff33");
        grad.addColorStop(1, n.type.color + "cc");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = n.type.color;
        ctx.lineWidth   = n.isHub ? 2 : 1;
        ctx.stroke();

        // Label for hubs
        if (n.isHub) {
          ctx.fillStyle = n.type.color;
          ctx.font      = "bold 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(n.type.label, n.x, n.y + n.r + 11);
        }

        // Load indicator ring
        ctx.strokeStyle = n.type.color + "66";
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 3, -Math.PI / 2, -Math.PI / 2 + n.load * Math.PI * 2);
        ctx.stroke();
      });

      // Live stats overlay (top-right corner of canvas)
      const activeCount = packets.length;
      ctx.fillStyle = "rgba(0,212,255,0.08)";
      ctx.fillRect(w - 160, 12, 148, 70);
      ctx.strokeStyle = "rgba(0,212,255,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(w - 160, 12, 148, 70);
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "#00d4ff";
      ctx.fillText("● LIVE NETWORK", w - 150, 28);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`Nodes:    ${nodes.length}`, w - 150, 44);
      ctx.fillText(`Packets:  ${activeCount}`, w - 150, 57);
      ctx.fillText(`Frame:    ${frame}`, w - 150, 70);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ opacity: 0.85 }}
    />
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start   = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / (duration * 1000);
      const t = Math.min(elapsed, 1);
      setVal(Math.floor(t * to));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "42,819 devices online", "94.2% model accuracy", "28ms avg latency",
  "12.4B inferences/day", "3 new models deployed", "99.97% platform uptime",
  "6 firmware OTA updates", "1,240 edge clusters", "ESP32 · Jetson · RPi · STM32",
  "Zero cold-start pods", "Auto-scaling enabled", "End-to-end encrypted",
];

const FEATURES = [
  { icon: Cpu, color: "cyan",   title: "Universal Device Support",      desc: "Manage ESP32, Jetson Nano, Raspberry Pi, STM32, Arduino, RISC-V and any custom hardware from one unified pane." },
  { icon: Brain, color: "violet", title: "On-Device ML Inference",      desc: "Deploy TensorFlow Lite, PyTorch, ONNX and OpenVINO models directly to constrained hardware — no cloud round-trip." },
  { icon: Activity, color: "green", title: "Real-Time Telemetry",       desc: "Sub-50ms streaming dashboards with live sensor readings, anomaly highlighting and instant alerting." },
  { icon: Shield, color: "yellow",  title: "Zero-Trust Security",       desc: "End-to-end encryption, certificate rotation, API-key management and fine-grained RBAC built in." },
  { icon: Zap, color: "orange",     title: "OTA Firmware Updates",      desc: "Atomic over-the-air updates with delta compression, rollback support and fleet-wide orchestration." },
  { icon: BarChart3, color: "pink", title: "Edge Analytics Engine",     desc: "Radar, heatmap, scatter and time-series charts — all computed at the edge and streamed live." },
  { icon: Workflow, color: "cyan",  title: "Automation Rules",          desc: "Build trigger-action pipelines with 40+ built-in conditions — no code required, unlimited complexity." },
  { icon: Cloud, color: "violet",   title: "Cloud-Agnostic Sync",       desc: "Bi-directional sync with AWS IoT Core, Azure IoT Hub, GCP Pub/Sub and your own MQTT broker." },
  { icon: Database, color: "green", title: "Time-Series Storage",       desc: "Append-optimised storage with configurable retention, automatic compression and Parquet exports." },
  { icon: Code, color: "yellow",    title: "Full REST + WebSocket API",  desc: "OpenAPI 3.1 spec, typed SDKs for Python / Node / Rust, and WebSocket push for live subscriptions." },
  { icon: Globe, color: "orange",   title: "Global Edge Network",       desc: "Distribute your AI models across 47 PoPs — automatic latency-based routing ensures sub-30ms round trips." },
  { icon: Key, color: "pink",       title: "API Key Vault",             desc: "Scoped API keys with rate limits, IP allowlists, expiry and per-key audit trails." },
];

const STATS = [
  { label: "Devices Connected",     value: 2847193,  suffix: "+",  icon: Cpu },
  { label: "Daily Inferences",      value: 12400000000, suffix: "+", icon: Brain },
  { label: "Avg Inference Latency", value: 28,        suffix: "ms", icon: Zap },
  { label: "Platform Uptime",       value: 99.97,     suffix: "%",  icon: Activity },
];

const PRICING = [
  { name: "Free",       price: "$0",   period: "forever",  features: ["10 devices","100K inferences/mo","Community support","1 user","REST API access"], cta: "Start Free", highlight: false },
  { name: "Pro",        price: "$49",  period: "/ month",  features: ["500 devices","50M inferences/mo","Email support","5 users","WebSocket API","OTA updates","Analytics"], cta: "Start Trial", highlight: true },
  { name: "Enterprise", price: "Custom", period: "/ month", features: ["Unlimited devices","Unlimited inferences","SLA guarantee","Unlimited users","Dedicated infra","On-prem option","SSO + audit logs"], cta: "Contact Sales", highlight: false },
];

const TESTIMONIALS = [
  { name: "Dr. Ayaan Kapoor", role: "CTO, Nexus Robotics", body: "AetherGrid cut our edge deployment cycle from weeks to hours. The OTA update system alone saved us an entire engineering sprint per quarter.", stars: 5 },
  { name: "Priya Venkataraman", role: "ML Lead, GridSense", body: "The inference playground on a $4 ESP32 seemed like science fiction. Now it's our production stack. 94% accuracy at 28ms blew every competitor out of the water.", stars: 5 },
  { name: "Lars Lindqvist", role: "Head of IoT, Voltur AB", body: "Zero-trust security and automated cert rotation removed 3 months of compliance work. The team onboarded in a day.", stars: 5 },
];

const USE_CASES = [
  { id: "manufacturing", label: "Smart Manufacturing",   icon: Gauge,   color: "cyan",   desc: "Deploy YOLOv8 defect-detection models to production-line cameras. Real-time quality gates with < 30ms latency." },
  { id: "agriculture",   label: "Precision Agriculture", icon: Map,     color: "green",  desc: "Thousands of soil, humidity and NDVI sensors synced to predictive irrigation and yield-forecast models." },
  { id: "retail",        label: "Retail Intelligence",   icon: Users,   color: "violet", desc: "People-flow analytics, shelf-stock detection and autonomous reorder — all running on low-cost ESP32 nodes." },
  { id: "energy",        label: "Energy Grids",          icon: Zap,     color: "yellow", desc: "Predict load spikes 15 minutes ahead, auto-route balancing commands, detect grid anomalies at the edge." },
  { id: "healthcare",    label: "Medical Devices",        icon: Activity, color: "pink",  desc: "HIPAA-compliant telemetry for wearables, infusion pumps and diagnostic equipment with sub-second alerts." },
];

const colorMap: Record<string, string> = {
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  violet: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  orange: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  pink: "text-pink-400 bg-pink-400/10 border-pink-400/30",
};

const API_SNIPPET = `import aethergrid as ag

# Authenticate
client = ag.Client(api_key="ag_live_YOUR_KEY")

# Stream live telemetry from any device
@client.on_reading("device/*", metrics=["cpu","temp","memory"])
def handle(reading):
    if reading.temperature > 75:
        client.command(reading.device_id, "throttle", {"level": 0.5})
        client.alert(f"⚠️ {reading.device_id} overheating: {reading.temperature}°C")

# Deploy a TFLite model to a device fleet
client.models.deploy(
    model_path="./models/yolov8_edge_v2.tflite",
    targets=client.devices.filter(type="ESP32", status="ONLINE"),
    rollout_pct=10,     # Canary: 10% first
    auto_rollback=True,
)

print(f"Fleet: {client.devices.online_count:,} devices live")`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(5,8,16,0)", "rgba(5,8,16,0.95)"]);
  const [menuOpen, setMenuOpen]    = useState(false);
  const [activeCase, setActiveCase] = useState("manufacturing");
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#050810] text-foreground overflow-x-hidden">

      {/* ── Sticky Nav ──────────────────────────────────────────────────────── */}
      <motion.nav style={{ backgroundColor: navBg }}
        className="fixed top-0 inset-x-0 z-50 border-b border-border/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-500/60 transition-colors">
              <CircuitBoard className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {[["#features","Features"],["#architecture","Architecture"],["#use-cases","Use Cases"],["#pricing","Pricing"],["#docs","Docs"]].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-cyan-400 transition-colors">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:flex text-sm text-muted-foreground hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20">
              Get Started Free
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-muted-foreground">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="md:hidden border-t border-border/30 bg-[#050810]/98 px-4 py-4 flex flex-col gap-3">
              {[["#features","Features"],["#architecture","Architecture"],["#use-cases","Use Cases"],["#pricing","Pricing"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-cyan-400 py-2 border-b border-border/20 transition-colors">{label}</a>
              ))}
              <Link href="/login" className="text-sm text-muted-foreground py-2">Sign In</Link>
              <Link href="/register" className="text-sm font-semibold text-cyan-400 py-2">Create Free Account →</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Real-time network canvas */}
        <div className="absolute inset-0 z-0">
          <NetworkCanvas />
        </div>

        {/* Radial gradient vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-[#050810]/40 to-[#050810] pointer-events-none z-[1]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050810] to-transparent z-[2]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            42,819 devices online right now
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-white">The Edge AI Platform</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              for Every Device
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy AI models from <span className="text-cyan-400 font-semibold">$3 ESP32 microcontrollers</span> to{" "}
            <span className="text-violet-400 font-semibold">NVIDIA GPU clusters</span>. Manage billions of IoT devices,
            stream real-time telemetry, and automate your entire edge fleet — all from one platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5">
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login?demo=1"
              onClick={e => { e.preventDefault(); window.location.href = "/login"; }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base border border-border/60 text-white hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Demo
            </Link>
          </motion.div>

          {/* Trust chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-8">
            {["No credit card","Free forever tier","Full API access","GDPR compliant"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero floating metrics */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 mt-16 w-full max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.08 }}
                className="bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-4 text-center hover:border-cyan-500/30 transition-all">
                <s.icon className="w-4 h-4 text-cyan-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  <Counter to={typeof s.value === "number" ? Math.min(s.value, 9999999) : 0}
                    suffix={s.suffix} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </section>

      {/* ── Live Ticker ──────────────────────────────────────────────────────── */}
      <div className="border-y border-border/30 bg-muted/20 py-2.5 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-8 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-cyan-400" />{item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features Grid ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <Section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 text-xs font-semibold mb-4">
            <Layers className="w-3 h-3" /> Platform Capabilities
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Everything your edge stack needs</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">12 integrated modules. Zero vendor lock-in. One unified control plane for your entire edge AI lifecycle.</p>
        </Section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group bg-card/50 border border-border/50 rounded-xl p-6 hover:border-border hover:bg-card/80 hover:-translate-y-1 transition-all duration-300">
              <div className={`inline-flex p-2.5 rounded-lg border mb-4 ${colorMap[f.color]}`}>
                <f.icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Architecture Diagram ─────────────────────────────────────────────── */}
      <section id="architecture" className="py-24 border-y border-border/30 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
              <Server className="w-3 h-3" /> System Architecture
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">How AetherGrid works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A three-tier architecture designed for latency-critical deployments at any scale.</p>
          </Section>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tier: "01", label: "Edge Devices", color: "cyan", items: ["ESP32 / ESP8266","NVIDIA Jetson","Raspberry Pi 4/5","STM32 / RISC-V","Custom hardware"], icon: CpuIcon, desc: "Your physical devices run the AetherGrid Edge Agent — a 40KB binary that handles telemetry, OTA, and local inference." },
              { tier: "02", label: "AetherGrid Core", color: "violet", items: ["MQTT / WebSocket broker","Time-series ingestion","Model registry","OTA orchestration","Rule engine"], icon: Server, desc: "The stateless cloud control plane — auto-scaled across Vercel Edge, processing 12.4B inference requests per day." },
              { tier: "03", label: "Your Applications", color: "green", items: ["REST + WebSocket API","Python / Node SDKs","Grafana connector","Webhook push","Export center"], icon: GitBranch, desc: "Consume real-time data and control your fleet via our typed SDKs or any HTTP client. Full OpenAPI 3.1 spec included." },
            ].map((t, i) => (
              <Section key={t.tier}>
                <motion.div whileHover={{ scale: 1.02 }} className="bg-card/50 border border-border/50 rounded-2xl p-6 h-full hover:border-border transition-all">
                  <div className={`text-5xl font-black mb-4 ${t.color === "cyan" ? "text-cyan-500/20" : t.color === "violet" ? "text-violet-500/20" : "text-emerald-500/20"}`}>
                    {t.tier}
                  </div>
                  <div className={`inline-flex p-2 rounded-lg border mb-3 ${colorMap[t.color]}`}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{t.label}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4">{t.desc}</p>
                  <ul className="space-y-1.5">
                    {t.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${t.color === "cyan" ? "text-cyan-400" : t.color === "violet" ? "text-violet-400" : "text-emerald-400"}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Section>
            ))}
          </div>

          {/* Connection lines diagram */}
          <Section className="mt-12">
            <div className="bg-card/30 border border-border/40 rounded-2xl p-6 overflow-x-auto">
              <div className="flex items-center justify-center gap-4 min-w-max mx-auto text-xs">
                {[
                  { label: "ESP32 Fleet", color: "cyan"   },
                  { label: "MQTT Broker", color: "violet" },
                  { label: "Model Registry", color: "violet" },
                  { label: "REST API", color: "violet" },
                  { label: "Your App", color: "green" },
                ].map((n, i, arr) => (
                  <div key={n.label} className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-lg border font-semibold ${colorMap[n.color]}`}>{n.label}</div>
                    {i < arr.length - 1 && (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-12 h-px bg-gradient-to-r from-cyan-500/30 to-violet-500/30" />
                        <span className="text-[9px] text-muted-foreground">TLS 1.3</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ── API Code Block ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Section>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-xs font-semibold mb-4">
              <Code className="w-3 h-3" /> Developer-First API
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Ship edge AI in minutes, not months</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">One API to manage devices, deploy models, stream telemetry and trigger automations. Full typed SDKs for Python, Node.js and Rust.</p>
            <div className="space-y-3">
              {[
                { label: "Python SDK",    ver: "pip install aethergrid" },
                { label: "Node.js SDK",   ver: "npm i @aethergrid/sdk" },
                { label: "REST API",      ver: "api.aethergrid.ai/v1" },
                { label: "WebSocket",     ver: "wss://live.aethergrid.ai" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-muted-foreground w-24">{s.label}</span>
                  <code className="text-cyan-400 font-mono">{s.ver}</code>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <Link href="/docs" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border/60 text-sm text-white hover:border-cyan-500/40 transition-all">
                <BookOpen className="w-4 h-4" /> Read Docs
              </Link>
              <Link href="/register" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-sm font-semibold hover:opacity-90 transition-all">
                Get API Key <Key className="w-4 h-4" />
              </Link>
            </div>
          </Section>

          <Section>
            <div className="bg-[#0a0e1a] border border-border/50 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">aethergrid_quickstart.py</span>
              </div>
              <pre className="p-4 text-[11px] text-emerald-300/90 font-mono overflow-x-auto leading-relaxed">
                <code>{API_SNIPPET}</code>
              </pre>
            </div>
          </Section>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────────────────────── */}
      <section id="use-cases" className="py-24 border-y border-border/30 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-4">
              <BrainCircuit className="w-3 h-3" /> Industry Solutions
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Built for the real world</h2>
          </Section>

          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {USE_CASES.map(u => (
              <button key={u.id} onClick={() => setActiveCase(u.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCase === u.id ? `${colorMap[u.color]} border` : "text-muted-foreground hover:text-white border border-border/40"}`}>
                <u.icon className="w-3.5 h-3.5" />{u.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {USE_CASES.filter(u => u.id === activeCase).map(u => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                className={`bg-card/50 border rounded-2xl p-8 max-w-2xl mx-auto text-center ${colorMap[u.color]}`}>
                <div className={`inline-flex p-3 rounded-xl border mb-4 ${colorMap[u.color]}`}>
                  <u.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{u.label}</h3>
                <p className="text-muted-foreground leading-relaxed">{u.desc}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <Section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 text-pink-400 text-xs font-semibold mb-4">
            <Gauge className="w-3 h-3" /> Pricing
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Start free. Scale to millions of devices with no hidden fees.</p>
        </Section>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative bg-card/50 border rounded-2xl p-7 flex flex-col ${p.highlight ? "border-cyan-500/50 shadow-2xl shadow-cyan-500/10" : "border-border/50"}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-xs font-bold">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-white text-lg mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  <span className="text-muted-foreground text-sm">{p.period}</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`text-center py-3 rounded-xl text-sm font-bold transition-all ${p.highlight ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20" : "border border-border/60 text-white hover:border-cyan-500/40"}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-border/30 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by edge AI teams</h2>
          </Section>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card/50 border border-border/50 rounded-2xl p-6 hover:border-border transition-all">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">&ldquo;{t.body}&rdquo;</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-32 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Section>
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl rounded-3xl" />
            <div className="bg-card/40 border border-border/50 rounded-3xl p-12">
              <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <Rocket className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Ready to deploy edge AI?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 4,200+ engineering teams deploying AI to the edge. Start free — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-2xl shadow-cyan-500/30">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold border border-border/60 text-white hover:border-cyan-500/40 transition-all">
                  <Zap className="w-4 h-4 text-cyan-400" /> Try Demo
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer id="docs" className="border-t border-border/30 bg-muted/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <CircuitBoard className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-sm">AetherGrid AI</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The world-scale edge AI platform. Deploy anywhere, manage everything.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="https://github.com/ShaikMuzzammil" target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                <a href="https://linktr.ee/Shaik_Muzzammil" target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-cyan-400 transition-colors"><ExternalLink className="w-4 h-4" /></a>
              </div>
            </div>

            {/* Links */}
            {[
              { heading: "Platform",   links: [["Dashboard","/dashboard"],["Devices","/devices"],["AI Models","/ai-models"],["Deployments","/deployments"],["Analytics","/analytics"]] },
              { heading: "Developers", links: [["Documentation","/docs"],["API Reference","/docs"],["Python SDK","#"],["Node.js SDK","#"],["WebSocket API","#"]] },
              { heading: "Company",    links: [["About","#"],["Blog","#"],["Careers","#"],["Status","#"],["Contact","#"]] },
              { heading: "Legal",      links: [["Terms of Service","/legal/terms"],["Privacy Policy","/legal/privacy"],["Security","#"],["GDPR","#"]] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2025 AetherGrid AI. Built by{" "}
              <a href="https://linktr.ee/Shaik_Muzzammil" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Shaik Muzzammil</a>.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
