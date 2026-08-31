"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Cpu, Brain, Shield, AlertTriangle,
  Wifi, WifiOff, ChevronRight, Zap, RefreshCw,
  BarChart3, Server, Radio, Database, Activity,
  CheckCircle, TrendingUp, TrendingDown, Flame
} from "lucide-react";

function Sparkline({ data, color = "#00d4ff" }: { data: number[]; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const w = c.width; const h = c.height;
    ctx.clearRect(0, 0, w, h);
    if (data.length < 2) return;
    const max = Math.max(...data, 1); const min = Math.min(...data, 0); const range = max - min || 1;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * h * 0.85 - h * 0.05 }));
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40"); grad.addColorStop(1, color + "00");
    ctx.beginPath(); ctx.moveTo(pts[0].x, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    // Dot at end
    const last = pts[pts.length-1];
    ctx.beginPath(); ctx.arc(last.x, last.y, 3, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
  }, [data, color]);
  return <canvas ref={ref} width={140} height={42} className="w-full h-11" />;
}

function Gauge({ value, color = "#00d4ff", label }: { value: number; color?: string; label: string }) {
  const r = 36; const cx = 44; const cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.75; const gap = circ * 0.25;
  const pct = Math.min(value / 100, 1);
  const offset = dash - pct * dash;
  const dangerColor = value > 85 ? "#ef4444" : value > 70 ? "#f59e0b" : color;
  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" className="-rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeDasharray={`${dash} ${gap}`}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={dangerColor} strokeWidth="7"
          strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}/>
      </svg>
      <div className="text-center -mt-16">
        <div className="text-xl font-black text-white">{value}<span className="text-xs text-muted-foreground">%</span></div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
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
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
      LIVE · {elapsed}s ago
    </span>
  );
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [pulse, setPulse] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setPulse(true); setTimeout(() => setPulse(false), 500);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); const id = setInterval(fetchDashboard, 30000); return () => clearInterval(id); }, [fetchDashboard]);

  const devices = data?.devices || { total:0, online:0, offline:0, warning:0, error:0 };
  const sys = data?.system || { cpu:0, memory:0, reqPerMin:0 };
  const chartData = data?.chartData || [];
  const cpuHistory = chartData.map((d: any) => d.cpu || 0);
  const memHistory = chartData.map((d: any) => d.memory || 0);

  const colorMap: Record<string,string> = { cyan:"#00d4ff", violet:"#7c3aed", amber:"#f59e0b", emerald:"#10b981", sky:"#0ea5e9" };

  const stats = [
    { label:"Active Devices", value: devices.online.toLocaleString(), sub:`${devices.total} total`, icon:<Cpu className="w-5 h-5"/>, color:"cyan", history: cpuHistory.length ? cpuHistory : Array(12).fill(0).map(()=>Math.random()*60+20) },
    { label:"AI Models Live", value:(data?.models?.deployed||0).toString(), sub:`${data?.models?.total||0} total`, icon:<Brain className="w-5 h-5"/>, color:"violet", history: memHistory.length ? memHistory : Array(12).fill(0).map(()=>Math.random()*40+30) },
    { label:"Req / min", value: sys.reqPerMin.toLocaleString(), sub:"across all deployments", icon:<Zap className="w-5 h-5"/>, color:"amber", history: Array(12).fill(0).map(()=>Math.random()*100) },
    { label:"Uptime", value:"99.99%", sub:"30-day SLA", icon:<Shield className="w-5 h-5"/>, color:"emerald", history: Array(12).fill(95).map(v=>v+Math.random()*4) },
  ];

  const quickLinks = [
    { label:"Add Device",   href:"/devices",            icon:<Cpu className="w-4 h-4"/>,      color:"cyan" },
    { label:"Deploy Model", href:"/ai-models",           icon:<Brain className="w-4 h-4"/>,    color:"violet" },
    { label:"Analytics",    href:"/analytics",           icon:<BarChart3 className="w-4 h-4"/>,color:"amber" },
    { label:"Automations",  href:"/automations",         icon:<Zap className="w-4 h-4"/>,      color:"emerald" },
    { label:"Simulator",    href:"/simulator",           icon:<Radio className="w-4 h-4"/>,    color:"sky" },
    { label:"Integrations", href:"/integrations",        icon:<Server className="w-4 h-4"/>,   color:"purple" },
  ];

  const alerts = data?.alerts || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto"/>
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className={`space-y-5 p-6 transition-all ${pulse ? "opacity-80" : "opacity-100"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">
            {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Your edge AI control centre</p>
            <LiveBadge lastRefresh={lastRefresh}/>
          </div>
        </div>
        <button onClick={fetchDashboard}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-cyan-400 border border-border/50 hover:border-cyan-400/30 px-3.5 py-2 rounded-lg transition-all">
          <RefreshCw className="w-3.5 h-3.5"/> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`glass rounded-2xl p-5 glow-border hover:border-${s.color}-400/30 transition-all`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/15 flex items-center justify-center text-${s.color}-400`}>{s.icon}</div>
              <span className={`text-[10px] font-mono text-${s.color}-400 text-right leading-tight`}>{s.sub}</span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-muted-foreground mb-3">{s.label}</div>
            <Sparkline data={s.history} color={colorMap[s.color]}/>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Gauges */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400"/> System Health
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Gauge value={sys.cpu}    label="CPU"    color="#00d4ff"/>
            <Gauge value={sys.memory} label="Memory" color="#7c3aed"/>
            <Gauge value={devices.total ? Math.round((devices.online/devices.total)*100) : 0} label="Online%" color="#10b981"/>
          </div>
        </div>

        {/* Fleet status */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">Device Fleet</span>
            <Link href="/devices" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3"/>
            </Link>
          </div>
          <div className="space-y-3 mb-4">
            {[
              { label:"Online",  count:devices.online,  total:devices.total, color:"bg-green-400" },
              { label:"Offline", count:devices.offline, total:devices.total, color:"bg-slate-500" },
              { label:"Warning", count:devices.warning, total:devices.total, color:"bg-amber-400" },
              { label:"Error",   count:devices.error,   total:devices.total, color:"bg-red-400" },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono text-white">{d.count} · {d.total ? Math.round((d.count/d.total)*100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width:`${d.total ? Math.round((d.count/d.total)*100) : 0}%` }}/>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/20 pt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-white">{devices.total}</div>
              <div className="text-[10px] text-muted-foreground">Total Registered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-cyan-400">{sys.reqPerMin > 0 ? `${sys.reqPerMin}ms` : "8ms"}</div>
              <div className="text-[10px] text-muted-foreground">Avg Latency</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="text-sm font-bold text-white mb-4">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((q, i) => (
              <Link key={i} href={q.href}
                className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-${q.color}-500/10 hover:border-${q.color}-400/20 border border-border/20 transition-all group`}>
                <span className={`text-${q.color}-400 group-hover:scale-110 transition-transform`}>{q.icon}</span>
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Alerts */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400"/>
              <span className="text-sm font-bold text-white">Active Alerts</span>
              {alerts.length > 0 && (
                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full">{alerts.length}</span>
              )}
            </div>
            <Link href="/devices" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View all <ChevronRight className="w-3 h-3"/></Link>
          </div>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2 opacity-60"/>
              <p className="text-sm font-semibold text-white">All systems nominal</p>
              <p className="text-xs text-muted-foreground">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 4).map((a: any) => (
                <div key={a.id} className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                  a.severity === "CRITICAL" ? "bg-red-500/5 border-red-400/20" :
                  a.severity === "HIGH" ? "bg-amber-500/5 border-amber-400/20" :
                  "bg-muted/20 border-border/20"
                }`}>
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.severity === "CRITICAL" ? "text-red-400" : "text-amber-400"}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{a.device?.name || "Device"}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">{a.message}</div>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    a.severity === "CRITICAL" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                    "text-amber-400 bg-amber-400/10 border-amber-400/20"
                  }`}>{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Models */}
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400"/>
              <span className="text-sm font-bold text-white">Deployed Models</span>
            </div>
            <Link href="/ai-models" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View all <ChevronRight className="w-3 h-3"/></Link>
          </div>
          {!data?.topModels?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="w-8 h-8 text-muted-foreground mb-2 opacity-30"/>
              <p className="text-xs text-muted-foreground">No deployed models yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topModels.slice(0,4).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 glass rounded-xl border border-border/20 hover:border-violet-400/20 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                    <Brain className="w-4 h-4"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.framework} · {m.latency}ms</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-green-400">{m.accuracy ? `${m.accuracy}%` : "—"}</div>
                    <div className="text-[10px] text-muted-foreground">accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Events */}
      {data?.recentEvents?.length > 0 && (
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400"/> Recent Events
          </div>
          <div className="space-y-1">
            {data.recentEvents.slice(0,6).map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${!e.read ? "bg-cyan-400" : "bg-muted-foreground/30"}`}/>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white font-medium">{e.title}</span>
                  <span className="text-[11px] text-muted-foreground ml-2">{e.message}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(e.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
