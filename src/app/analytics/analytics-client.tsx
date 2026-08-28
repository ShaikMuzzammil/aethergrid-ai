"use client";
import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { BarChart3, TrendingUp, Download, Filter, Brain, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RANGES = ["1H", "24H", "7D", "30D", "90D"];

function gen(n: number, base: number, variance: number) {
  return Array.from({ length: n }, (_, i) => ({
    time: n <= 24 ? `${i}:00` : n <= 7 ? `Day ${i + 1}` : `Week ${Math.floor(i / 7) + 1} Day ${(i % 7) + 1}`,
    value: Math.max(0, base + Math.sin(i * 0.4) * variance + Math.random() * variance * 0.5),
    value2: Math.max(0, base * 0.7 + Math.sin(i * 0.3 + 1) * variance * 0.8 + Math.random() * variance * 0.4),
  }));
}

const DEVICE_TYPE_DATA = [
  { name: "ESP32/8266", value: 1240, fill: "#00D4FF" },
  { name: "Raspberry Pi", value: 680, fill: "#7C3AED" },
  { name: "NVIDIA Jetson", value: 420, fill: "#10B981" },
  { name: "STM32", value: 310, fill: "#F59E0B" },
  { name: "Arduino", value: 180, fill: "#EF4444" },
  { name: "Custom", value: 17, fill: "#6B7280" },
];

const GEO_DATA = [
  { region: "North America", devices: 1240, data: 420, models: 12 },
  { region: "Europe", devices: 890, data: 310, models: 8 },
  { region: "Asia Pacific", devices: 560, data: 190, models: 15 },
  { region: "South America", devices: 120, data: 42, models: 3 },
  { region: "Middle East", devices: 37, data: 14, models: 2 },
];

const MODEL_PERF_RADAR = [
  { metric: "Accuracy", YOLOv8: 94, Anomaly: 92, NLP: 89 },
  { metric: "Speed", YOLOv8: 88, Anomaly: 96, NLP: 72 },
  { metric: "Efficiency", YOLOv8: 82, Anomaly: 90, NLP: 78 },
  { metric: "Reliability", YOLOv8: 95, Anomaly: 93, NLP: 88 },
  { metric: "Scalability", YOLOv8: 79, Anomaly: 85, NLP: 91 },
];

const THROUGHPUT_BY_HOUR = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  ingress: Math.floor(200 + Math.sin(h * 0.3) * 100 + Math.random() * 50),
  egress: Math.floor(150 + Math.sin(h * 0.3 + 0.5) * 80 + Math.random() * 40),
  errors: Math.floor(Math.random() * 15),
}));

const ERROR_BREAKDOWN = [
  { name: "Timeout", value: 38, color: "#EF4444" },
  { name: "Auth Failed", value: 22, color: "#F59E0B" },
  { name: "Rate Limited", value: 18, color: "#7C3AED" },
  { name: "Conn Error", value: 14, color: "#6B7280" },
  { name: "Other", value: 8, color: "#374151" },
];

const INSIGHT_CARDS = [
  { title: "Peak Usage Window", value: "2PM–6PM UTC", trend: "+23%", desc: "Highest inference load period. Consider scaling replicas during this window.", color: "cyan", icon: <Activity className="w-5 h-5" /> },
  { title: "Best Performing Model", value: "YOLOv8 Edge v2", trend: "94.2% acc", desc: "Consistently highest accuracy with lowest latency across all edge hardware.", color: "green", icon: <Brain className="w-5 h-5" /> },
  { title: "Top Device Region", value: "North America", trend: "1,240 devices", desc: "Highest device density. Latency avg 28ms — well within SLA threshold.", color: "violet", icon: <Globe className="w-5 h-5" /> },
  { title: "Anomaly Detected", value: "Spike at 03:00", trend: "5x normal", desc: "Unusual throughput spike at 3AM. Investigate device cluster in Warehouse B.", color: "yellow", icon: <TrendingUp className="w-5 h-5" /> },
];

export function AnalyticsClient() {
  const [range, setRange] = useState("24H");
  const [tab, setTab] = useState<"overview" | "devices" | "models" | "network">("overview");

  const telData = gen(range === "1H" ? 12 : range === "24H" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 90, 2800, 400);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deep insights across your entire edge AI fleet</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", range === r ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground")}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => toast.info("Exporting analytics report...")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 p-1 bg-muted/20 rounded-xl w-fit border border-border/50">
        {[{ id: "overview", label: "Overview" }, { id: "devices", label: "Devices" }, { id: "models", label: "AI Models" }, { id: "network", label: "Network" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", tab === t.id ? "bg-card text-foreground border border-border/60 shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {INSIGHT_CARDS.map((card, i) => (
          <div key={i} className={cn("glass rounded-xl p-4 glow-border border-l-2", `border-l-${card.color}-400`)}>
            <div className={`text-${card.color}-400 mb-3 w-9 h-9 rounded-lg bg-${card.color}-400/10 flex items-center justify-center`}>{card.icon}</div>
            <p className="text-xs text-muted-foreground">{card.title}</p>
            <p className="text-base font-bold text-foreground mt-0.5">{card.value}</p>
            <p className={`text-xs text-${card.color}-400 mt-0.5`}>{card.trend}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Main area chart */}
          <div className="glass rounded-2xl p-6 glow-border">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-semibold text-foreground">Active Device Count</h3>
                <p className="text-xs text-muted-foreground">Device connection trends over selected period</p></div>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={telData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} /><stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "12px" }} />
                <Legend />
                <ReferenceLine y={3000} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Capacity", fontSize: 10, fill: "#EF4444" }} />
                <Area type="monotone" dataKey="value" name="Active Devices" stroke="#00D4FF" fill="url(#areaGrad)" strokeWidth={2.5} dot={false} />
                <Area type="monotone" dataKey="value2" name="New Connections" stroke="#7C3AED" fill="url(#areaGrad2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Throughput */}
            <div className="glass rounded-2xl p-6 glow-border">
              <h3 className="font-semibold text-foreground mb-1">Data Throughput</h3>
              <p className="text-xs text-muted-foreground mb-4">Ingress vs egress over 24h</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={THROUGHPUT_BY_HOUR.filter((_, i) => i % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }} />
                  <Legend />
                  <Bar dataKey="ingress" name="Ingress MB/s" fill="#00D4FF" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="egress" name="Egress MB/s" fill="#7C3AED" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Device type pie */}
            <div className="glass rounded-2xl p-6 glow-border">
              <h3 className="font-semibold text-foreground mb-1">Device Fleet Composition</h3>
              <p className="text-xs text-muted-foreground mb-4">Registered devices by hardware type</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={DEVICE_TYPE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {DEVICE_TYPE_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {DEVICE_TYPE_DATA.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Geographic distribution */}
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-semibold text-foreground mb-1">Geographic Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Device count and data volume by region</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50">
                  {["Region", "Devices", "Data Volume", "AI Models", "Avg Latency", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                  ))}</tr></thead>
                <tbody>
                  {GEO_DATA.map((row, i) => (
                    <tr key={i} className="data-table-row">
                      <td className="px-4 py-3 font-medium text-foreground">{row.region}</td>
                      <td className="px-4 py-3 text-cyan-400">{row.devices.toLocaleString()}</td>
                      <td className="px-4 py-3 text-violet-400">{row.data} TB</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.models}</td>
                      <td className="px-4 py-3 text-green-400">{Math.floor(25 + i * 8)}ms</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Healthy</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "models" && (
        <div className="space-y-6">
          {/* Radar chart */}
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-semibold text-foreground mb-1">Model Performance Comparison</h3>
            <p className="text-xs text-muted-foreground mb-4">Multi-dimensional performance metrics across top models</p>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={MODEL_PERF_RADAR}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }} />
                <Legend />
                <Radar name="YOLOv8" dataKey="YOLOv8" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.2} />
                <Radar name="Anomaly" dataKey="Anomaly" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Radar name="NLP" dataKey="NLP" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Error breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 glow-border">
              <h3 className="font-semibold text-foreground mb-4">Inference Error Breakdown</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={ERROR_BREAKDOWN} cx="50%" cy="50%" outerRadius={80} dataKey="value" strokeWidth={0}>
                      {ERROR_BREAKDOWN.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {ERROR_BREAKDOWN.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: e.color }} /><span className="text-muted-foreground">{e.name}</span></div>
                      <span className="font-medium text-foreground">{e.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 glow-border">
              <h3 className="font-semibold text-foreground mb-4">Request Volume by Model</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: "YOLOv8", requests: 1842000 }, { name: "Anomaly", requests: 4520000 },
                  { name: "NLP", requests: 890000 }, { name: "TimeSeq", requests: 320000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }}
                    formatter={(v: number) => [`${(v / 1000000).toFixed(2)}M`, "Requests"]} />
                  <Bar dataKey="requests" name="Requests" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "devices" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-semibold text-foreground mb-4">Device Activity Heatmap</h3>
            <div className="grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground pb-1">{d}</div>
              ))}
              {Array.from({ length: 7 * 12 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <div key={i} className="aspect-square rounded-sm transition-all hover:scale-110 cursor-pointer"
                    style={{ background: `rgba(0, 212, 255, ${intensity * 0.8})` }}
                    title={`${Math.floor(intensity * 2847)} devices active`} />
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-end">
              <span>Less</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => <div key={v} className="w-3 h-3 rounded-sm" style={{ background: `rgba(0,212,255,${v})` }} />)}
              <span>More</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-semibold text-foreground mb-4">Firmware Version Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { version: "v2.4.1", devices: 1240 }, { version: "v2.3.8", devices: 680 },
                { version: "v2.3.5", devices: 420 }, { version: "v2.2.1", devices: 310 },
                { version: "v2.1.0", devices: 197 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="version" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }} />
                <Bar dataKey="devices" name="Devices" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "network" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 glow-border">
            <h3 className="font-semibold text-foreground mb-4">Network Latency Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                latency: `${i * 5}ms`,
                p50: Math.max(0, 100 - Math.abs(i - 6) * 15 + Math.random() * 10),
                p95: Math.max(0, 80 - Math.abs(i - 9) * 12 + Math.random() * 8),
                p99: Math.max(0, 60 - Math.abs(i - 14) * 10 + Math.random() * 6),
              }))}>
                <defs>
                  {[["p50", "#00D4FF"], ["p95", "#F59E0B"], ["p99", "#EF4444"]].map(([k, c]) => (
                    <linearGradient key={k} id={`ng_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} /><stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="latency" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "10px", fontSize: "11px" }} />
                <Legend />
                <Area type="monotone" dataKey="p50" name="p50" stroke="#00D4FF" fill="url(#ng_p50)" strokeWidth={2} />
                <Area type="monotone" dataKey="p95" name="p95" stroke="#F59E0B" fill="url(#ng_p95)" strokeWidth={2} />
                <Area type="monotone" dataKey="p99" name="p99" stroke="#EF4444" fill="url(#ng_p99)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
