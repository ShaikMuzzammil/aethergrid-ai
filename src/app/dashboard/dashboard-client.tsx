"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Cpu, Brain, Shield, AlertTriangle,
  Wifi, WifiOff, Clock, ChevronRight, Zap, RefreshCw,
  BarChart3, Server, Radio, Database, Activity, CheckCircle
} from "lucide-react";

function Sparkline({ data, color = "#00d4ff" }: { data: number[]; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const w = c.width; const h = c.height;
    ctx.clearRect(0, 0, w, h);
    if (data.length < 2) return;
    const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * h * 0.85 - h * 0.05 }));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40"); grad.addColorStop(1, color + "00");
    ctx.beginPath(); ctx.moveTo(pts[0].x, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} width={120} height={36} className="w-full h-9" />;
}

function Gauge({ value, color = "#00d4ff", label }: { value: number; color?: string; label: string }) {
  const r = 36; const cx = 44; const cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75; const gap = circ * 0.25;
  const pct = Math.min(value / 100, 1);
  const offset = dash - pct * dash;
  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" className="-rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeDasharray={`${dash} ${gap}`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="text-center -mt-16">
        <div className="text-xl font-black text-white">{value}<span className="text-xs text-muted-foreground">%</span></div>
        <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function LiveBadge({ lastRefresh }: { lastRefresh: Date | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(lastRefresh ? Math.floor((Date.now() - lastRefresh.getTime()) / 1000) : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [lastRefresh]);
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-green-400 border border-green-400/30 bg-green-400/5 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      LIVE · {elapsed}s ago
    </span>
  );
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch {
      // keep whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); const id = setInterval(fetchDashboard, 30000); return () => clearInterval(id); }, [fetchDashboard]);

  const devices = data?.devices || { total: 0, online: 0, offline: 0, warning: 0, error: 0 };
  const sys = data?.system || { cpu: 0, memory: 0, reqPerMin: 0 };
  const chartData = data?.chartData || [];
  const cpuHistory = chartData.map((d: any) => d.cpu || 0);
  const memHistory = chartData.map((d: any) => d.memory || 0);

  const colorMap: Record<string, string> = { cyan: "#00d4ff", violet: "#7c3aed", amber: "#f59e0b", emerald: "#10b981" };

  const stats = [
    { label: "Active Devices", value: devices.online.toLocaleString(), sub: `${devices.total} total`, icon: <Cpu className="w-5 h-5" />, color: "cyan", history: cpuHistory.length ? cpuHistory : Array(12).fill(0) },
    { label: "AI Models Live", value: (data?.models?.deployed || 0).toString(), sub: `${data?.models?.total || 0} total`, icon: <Brain className="w-5 h-5" />, color: "violet", history: memHistory.length ? memHistory : Array(12).fill(0) },
    { label: "Req / min", value: sys.reqPerMin.toLocaleString(), sub: "across all deployments", icon: <Zap className="w-5 h-5" />, color: "amber", history: Array(12).fill(0).map(() => Math.random() * 100) },
    { label: "Uptime", value: "99.99%", sub: "30-day SLA", icon: <Shield className="w-5 h-5" />, color: "emerald", history: Array(12).fill(95).map(v => v + Math.random() * 4) },
  ];

  const notifIconMap: Record<string, any> = {
    DEVICE_ALERT: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    MODEL_COMPLETE: <Brain className="w-3.5 h-3.5 text-violet-400" />,
    DEPLOYMENT: <Server className="w-3.5 h-3.5 text-cyan-400" />,
    SECURITY: <Shield className="w-3.5 h-3.5 text-green-400" />,
    SYSTEM: <Database className="w-3.5 h-3.5 text-emerald-400" />,
    TEAM: <Radio className="w-3.5 h-3.5 text-purple-400" />,
  };

  const quickLinks = [
    { label: "Add Device", href: "/devices", icon: <Cpu className="w-4 h-4" />, color: "cyan" },
    { label: "Deploy Model", href: "/ai-models", icon: <Brain className="w-4 h-4" />, color: "violet" },
    { label: "Analytics", href: "/analytics", icon: <BarChart3 className="w-4 h-4" />, color: "amber" },
    { label: "Automations", href: "/automations", icon: <Zap className="w-4 h-4" />, color: "emerald" },
    { label: "API Keys", href: "/settings/api-keys", icon: <Server className="w-4 h-4" />, color: "sky" },
    { label: "Integrations", href: "/integrations", icon: <Radio className="w-4 h-4" />, color: "purple" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );

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
            <LiveBadge lastRefresh={lastRefresh} />
          </div>
        </div>
        <button onClick={fetchDashboard} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-cyan-400 border border-border/50 hover:border-cyan-400/30 px-3.5 py-2 rounded-lg transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-5 glow-border hover:border-cyan-400/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 flex items-center justify-center text-${s.color}-400`}>{s.icon}</div>
              <span className={`text-[10px] font-mono text-${s.color}-400`}>{s.sub}</span>
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
            <Gauge value={sys.cpu} label="CPU" color="#00d4ff" />
            <Gauge value={sys.memory} label="Memory" color="#7c3aed" />
            <Gauge value={devices.total ? Math.round((devices.online / devices.total) * 100) : 0} label="Online%" color="#10b981" />
          </div>
        </div>

        {/* Device fleet status */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Device Fleet</span>
            <Link href="/devices" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {[
              { label: "Online", count: devices.online, total: devices.total, color: "bg-green-400" },
              { label: "Offline", count: devices.offline, total: devices.total, color: "bg-slate-500" },
              { label: "Warning", count: devices.warning, total: devices.total, color: "bg-amber-400" },
              { label: "Error", count: devices.error, total: devices.total, color: "bg-red-400" },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono text-white">{d.count} · {d.total ? Math.round((d.count / d.total) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width: `${d.total ? Math.round((d.count / d.total) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-white">{devices.total}</div>
              <div className="text-[10px] text-muted-foreground">Total Registered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-cyan-400">{devices.online > 0 ? "8ms" : "—"}</div>
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

      {/* Events + Top Models */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Recent Events</span>
            <LiveBadge lastRefresh={lastRefresh} />
          </div>
          <div className="space-y-3">
            {(data?.recentEvents?.length ? data.recentEvents : []).slice(0, 6).map((ev: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="w-6 h-6 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                  {notifIconMap[ev.type] || <Activity className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{ev.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug truncate">{ev.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ev.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                    ? new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : new Date(ev.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
            {!data?.recentEvents?.length && (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400/40" />
                No recent events
              </div>
            )}
          </div>
        </div>

        {/* Top Models */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Top Models</span>
            <Link href="/ai-models" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">Manage <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-4">
            {(data?.topModels?.length ? data.topModels : []).slice(0, 5).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-400 shrink-0">
                  {m.framework?.slice(0, 2) || "AI"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white truncate">{m.name}</span>
                    {m.accuracy && <span className="text-[10px] font-mono text-green-400 ml-2 shrink-0">{m.accuracy}%</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {m.latency && <span><Zap className="w-2.5 h-2.5 inline mr-0.5 text-amber-400" />{m.latency}ms</span>}
                    <span><Cpu className="w-2.5 h-2.5 inline mr-0.5 text-cyan-400" />{m.deviceCount || m.deployments?.length || 0} deploy</span>
                    <span className="ml-auto px-1.5 py-0.5 rounded font-mono text-green-400 bg-green-400/10">{m.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {!data?.topModels?.length && (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <Brain className="w-8 h-8 mx-auto mb-2 text-violet-400/40" />
                No deployed models yet
                <br /><Link href="/ai-models" className="text-cyan-400 hover:underline mt-1 block">Upload your first model →</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-sm font-bold text-white">Fleet Telemetry — Last 24h</span>
              <span className="text-xs text-muted-foreground ml-3">Real device readings (hourly avg)</span>
            </div>
            <div className="flex gap-3">
              {[{ label: "CPU", color: "bg-cyan-400" }, { label: "Memory", color: "bg-violet-400" }].map((leg, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className={`w-2 h-2 rounded-full ${leg.color}`} />{leg.label}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { data: cpuHistory, color: "#00d4ff", label: "CPU Usage" },
              { data: memHistory, color: "#7c3aed", label: "Memory" },
            ].map((chart, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">{chart.label}</span>
                  <span className="text-[10px] font-mono" style={{ color: chart.color }}>
                    {chart.data.length ? Math.round(chart.data[chart.data.length - 1]) : 0}%
                  </span>
                </div>
                <Sparkline data={chart.data.length ? chart.data : Array(12).fill(0)} color={chart.color} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { DashboardClient };
