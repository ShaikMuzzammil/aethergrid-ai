"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Cpu, Brain, Activity, Shield, TrendingUp, AlertTriangle,
  Wifi, WifiOff, Clock, ChevronRight, Zap, RefreshCw,
  BarChart3, Server, Radio, Database
} from "lucide-react";

// ── Live Sparkline Canvas ─────────────────────────────────────────────────────
function Sparkline({ data, color = "#00d4ff" }: { data: number[]; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data); const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * h * 0.85 - h * 0.05 }));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40"); grad.addColorStop(1, color + "00");
    ctx.beginPath(); ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }, [data, color]);
  return <canvas ref={canvasRef} width={120} height={36} className="w-full h-9" />;
}

// ── Radial Gauge ─────────────────────────────────────────────────────────────
function Gauge({ value, max = 100, color = "#00d4ff", label }: { value: number; max?: number; color?: string; label: string }) {
  const pct = Math.min(value / max, 1);
  const r = 36; const cx = 44; const cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75; const gap = circ * 0.25;
  const offset = dash - pct * dash;
  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" className="-rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"
          strokeDasharray={`${dash} ${gap}`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center -mt-16">
        <div className="text-xl font-black text-white">{value}<span className="text-xs text-muted-foreground">%</span></div>
        <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

// ── Animated ticker ───────────────────────────────────────────────────────────
function LiveBadge() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 2000); return () => clearInterval(id); }, []);
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-green-400 border border-green-400/30 bg-green-400/5 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      LIVE · {tick}s ago
    </span>
  );
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [cpuHistory] = useState(() => Array.from({ length: 24 }, () => 30 + Math.random() * 50));
  const [memHistory] = useState(() => Array.from({ length: 24 }, () => 40 + Math.random() * 40));
  const [netHistory] = useState(() => Array.from({ length: 24 }, () => 20 + Math.random() * 70));
  const [refreshed, setRefreshed] = useState(false);
  const [liveDevices, setLiveDevices] = useState(2847);
  const [liveInference, setLiveInference] = useState(1240);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveDevices(v => v + Math.floor(Math.random() * 5 - 2));
      setLiveInference(v => Math.max(800, v + Math.floor(Math.random() * 40 - 20)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const stats = [
    { label: "Active Devices", value: liveDevices.toLocaleString(), change: "+12.3%", icon: <Cpu className="w-5 h-5" />, color: "cyan", history: cpuHistory },
    { label: "AI Models Live", value: "34", change: "+3 today", icon: <Brain className="w-5 h-5" />, color: "violet", history: memHistory },
    { label: "Inference/sec", value: liveInference.toLocaleString(), change: "±real-time", icon: <Zap className="w-5 h-5" />, color: "amber", history: netHistory },
    { label: "Uptime", value: "99.99%", change: "30-day SLA", icon: <Shield className="w-5 h-5" />, color: "emerald", history: cpuHistory.map(v => v * 0.3 + 70) },
  ];

  const colorMap: Record<string, string> = { cyan: "#00d4ff", violet: "#7c3aed", amber: "#f59e0b", emerald: "#10b981" };

  const recentEvents = [
    { icon: <Wifi className="w-3.5 h-3.5 text-green-400" />, text: "ESP32-Warehouse-A01 came online", time: "2m ago", type: "success" },
    { icon: <Brain className="w-3.5 h-3.5 text-violet-400" />, text: "YOLOv8 model deployed to 128 devices", time: "14m ago", type: "info" },
    { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />, text: "RPi4-Gateway-Main: high CPU (87%)", time: "31m ago", type: "warning" },
    { icon: <WifiOff className="w-3.5 h-3.5 text-red-400" />, text: "STM32-TempSensor-01 went offline", time: "1h ago", type: "error" },
    { icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />, text: "Security scan completed — no threats", time: "2h ago", type: "info" },
    { icon: <Database className="w-3.5 h-3.5 text-emerald-400" />, text: "Daily backup completed (2.4 GB)", time: "3h ago", type: "success" },
  ];

  const quickLinks = [
    { label: "Add Device", href: "/devices", icon: <Cpu className="w-4 h-4" />, color: "cyan" },
    { label: "Deploy Model", href: "/ai-models", icon: <Brain className="w-4 h-4" />, color: "violet" },
    { label: "Analytics", href: "/analytics", icon: <BarChart3 className="w-4 h-4" />, color: "amber" },
    { label: "Automations", href: "/automations", icon: <Zap className="w-4 h-4" />, color: "emerald" },
    { label: "API Keys", href: "/settings/api-keys", icon: <Server className="w-4 h-4" />, color: "sky" },
    { label: "Integrations", href: "/integrations", icon: <Radio className="w-4 h-4" />, color: "purple" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">
            {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Your edge AI control centre</p>
            <LiveBadge />
          </div>
        </div>
        <button onClick={() => setRefreshed(!refreshed)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-cyan-400 border border-border/50 hover:border-cyan-400/30 px-3.5 py-2 rounded-lg transition-all">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshed ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-5 glow-border hover:border-cyan-400/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 flex items-center justify-center text-${s.color}-400`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-mono text-${s.color}-400`}>{s.change}</span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground mb-3">{s.label}</div>
            <Sparkline data={s.history} color={colorMap[s.color]} />
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Gauges */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="text-sm font-bold text-white mb-5">System Health</div>
          <div className="grid grid-cols-3 gap-2">
            <Gauge value={72} label="CPU" color="#00d4ff" />
            <Gauge value={58} label="Memory" color="#7c3aed" />
            <Gauge value={43} label="Network" color="#10b981" />
          </div>
        </div>

        {/* Device status */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Device Fleet</span>
            <Link href="/devices" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { label: "Online", count: liveDevices - 650, pct: 77, color: "bg-green-400" },
              { label: "Offline", count: 420, pct: 15, color: "bg-slate-500" },
              { label: "Warning", count: 134, pct: 5, color: "bg-amber-400" },
              { label: "Error", count: 96, pct: 3, color: "bg-red-400" },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono text-white">{d.count.toLocaleString()} · {d.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-white">{liveDevices.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Total Registered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-cyan-400">8ms</div>
              <div className="text-[10px] text-muted-foreground">Avg Latency</div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="text-sm font-bold text-white mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2.5">
            {quickLinks.map((l, i) => (
              <Link key={i} href={l.href}
                className={`flex items-center gap-2.5 p-3 rounded-xl bg-${l.color}-500/8 border border-${l.color}-500/20 hover:border-${l.color}-400/40 hover:bg-${l.color}-500/15 transition-all group`}>
                <span className={`text-${l.color}-400 group-hover:scale-110 transition-transform`}>{l.icon}</span>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Model Performance */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent events */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Recent Events</span>
            <LiveBadge />
          </div>
          <div className="space-y-3">
            {recentEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="w-6 h-6 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">{ev.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-snug">{ev.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{ev.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Model performance */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Top Models</span>
            <Link href="/ai-models" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { name: "YOLOv8 Edge Detector", acc: 94.2, lat: 28, devices: 128, framework: "TFLite", status: "DEPLOYED" },
              { name: "Anomaly Sentinel", acc: 91.8, lat: 12, devices: 64, framework: "ONNX", status: "DEPLOYED" },
              { name: "NLP Intent Classifier", acc: 88.5, lat: 45, devices: 32, framework: "PyTorch", status: "DEPLOYED" },
              { name: "MobileNet Classifier", acc: 92.1, lat: 8, devices: 256, framework: "TFLite", status: "TRAINED" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shrink-0">
                  {m.framework.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate">{m.name}</span>
                    <span className="text-[10px] font-mono text-green-400 ml-2 shrink-0">{m.acc}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span><Zap className="w-2.5 h-2.5 inline mr-0.5 text-amber-400" />{m.lat}ms</span>
                    <span><Cpu className="w-2.5 h-2.5 inline mr-0.5 text-cyan-400" />{m.devices} devices</span>
                    <span className={`ml-auto px-1.5 py-0.5 rounded font-mono ${m.status === "DEPLOYED" ? "text-green-400 bg-green-400/10" : "text-amber-400 bg-amber-400/10"}`}>{m.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry chart */}
      <div className="glass rounded-2xl p-5 glow-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-sm font-bold text-white">Fleet Telemetry — Last 24h</span>
            <span className="text-xs text-muted-foreground ml-3">All device readings aggregated</span>
          </div>
          <div className="flex gap-3">
            {[{ label: "CPU", color: "bg-cyan-400" }, { label: "Memory", color: "bg-violet-400" }, { label: "Network", color: "bg-emerald-400" }].map((leg, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${leg.color}`} />{leg.label}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { data: cpuHistory, color: "#00d4ff", label: "CPU Usage" },
            { data: memHistory, color: "#7c3aed", label: "Memory" },
            { data: netHistory, color: "#10b981", label: "Network I/O" },
          ].map((chart, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground">{chart.label}</span>
                <span className="text-[10px] font-mono" style={{ color: chart.color }}>
                  {Math.round(chart.data[chart.data.length - 1])}%
                </span>
              </div>
              <Sparkline data={chart.data} color={chart.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
