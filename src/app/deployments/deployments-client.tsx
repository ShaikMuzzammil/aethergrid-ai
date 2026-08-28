"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Plus, Search, RefreshCw, Play, Square, RotateCcw, Trash2,
  Globe, Clock, Check, X,
  ChevronDown, Terminal, BarChart2, Settings, AlertTriangle
} from "lucide-react";
import { cn, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

const DEPLOYMENT_TYPES = ["API_SERVICE", "MODEL_SERVING", "WEB_APP", "BACKGROUND_WORKER", "DATA_PIPELINE", "EDGE_FUNCTION"];
const TYPE_ICONS: Record<string, string> = {
  API_SERVICE: "🔌", MODEL_SERVING: "🤖", WEB_APP: "🌐",
  BACKGROUND_WORKER: "⚙️", DATA_PIPELINE: "📊", EDGE_FUNCTION: "⚡",
};

const MOCK_DEPLOYMENTS = Array.from({ length: 12 }, (_, i) => ({
  id: `dep_${i + 1}`,
  name: [
    "Object Detection API", "Sensor Aggregator", "Edge Inference Server",
    "Data Pipeline v2", "NLP Classifier Service", "Anomaly Monitor",
    "Real-time Dashboard", "Firmware Updater", "Analytics Worker",
    "Alert Dispatcher", "Model Registry API", "Gateway Proxy"
  ][i],
  type: DEPLOYMENT_TYPES[i % DEPLOYMENT_TYPES.length],
  status: ["RUNNING", "RUNNING", "RUNNING", "STOPPED", "RUNNING", "UPDATING", "RUNNING", "FAILED", "RUNNING", "RUNNING", "STOPPED", "RUNNING"][i],
  url: i % 3 !== 2 ? `https://dep-${i + 1}.aethergrid.ai` : undefined,
  replicas: [3, 1, 5, 1, 2, 2, 1, 1, 3, 1, 1, 4][i],
  cpuUsage: Math.floor(15 + Math.random() * 65),
  memUsage: Math.floor(20 + Math.random() * 60),
  requestsPerMin: Math.floor(100 + Math.random() * 2000),
  errorRate: parseFloat((Math.random() * 2).toFixed(2)),
  uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
  lastDeployed: new Date(Date.now() - Math.random() * 30 * 86400000),
  version: `v${1 + Math.floor(i / 4)}.${i % 4}.${Math.floor(Math.random() * 10)}`,
  region: ["us-east-1", "eu-west-1", "ap-southeast-1"][i % 3],
}));

function MetricsSparkline({ color = "#00D4FF" }: { color?: string }) {
  const data = Array.from({ length: 12 }, () => ({ v: Math.floor(30 + Math.random() * 70) }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CreateDeploymentModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", type: "API_SERVICE", replicas: "1", cpuLimit: "500m", memLimit: "512Mi", region: "us-east-1" });
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const LOGS = [
    "🔍 Validating deployment configuration...",
    "📦 Pulling container image v1.0.0...",
    "🔧 Applying resource limits (CPU: 500m, MEM: 512Mi)...",
    "🌐 Provisioning load balancer...",
    "🚀 Starting 1 replica(s)...",
    "✅ Health check passed — service is live!",
  ];

  async function handleDeploy() {
    setDeploying(true); setDeployLog([]);
    for (let i = 0; i < LOGS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setDeployLog(p => [...p, LOGS[i]]);
      setDeployProgress(Math.floor(((i + 1) / LOGS.length) * 100));
    }
    await new Promise(r => setTimeout(r, 400));
    toast.success(`"${form.name}" deployed successfully!`);
    setDeploying(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div><h2 className="font-bold text-foreground">New Deployment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map(s => <div key={s} className={cn("flex-1 h-1 rounded-full transition-all", s <= step ? "bg-primary" : "bg-muted")} />)}
        </div>
        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deployment Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. object-detection-api" className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Deployment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPLOYMENT_TYPES.map(type => (
                    <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                      className={cn("flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all",
                        form.type === type ? "border-primary/60 bg-primary/10 text-primary" : "border-border/50 hover:border-border text-muted-foreground hover:bg-muted/30")}>
                      <span>{TYPE_ICONS[type]}</span>
                      <span className="text-xs">{type.replace(/_/g, " ")}</span>
                      {form.type === type && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Replicas", key: "replicas", options: ["1", "2", "3", "5", "10", "Auto"] },
                  { label: "CPU Limit", key: "cpuLimit", options: ["250m", "500m", "1", "2", "4"] },
                  { label: "Memory Limit", key: "memLimit", options: ["256Mi", "512Mi", "1Gi", "2Gi", "4Gi"] },
                  { label: "Region", key: "region", options: ["us-east-1", "eu-west-1", "ap-southeast-1", "us-west-2"] },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                    <select value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-xs font-medium text-foreground mb-2">Environment Variables</p>
                <textarea placeholder="KEY=value&#10;API_KEY=your-key&#10;LOG_LEVEL=info" rows={4}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="glass rounded-xl p-4 border border-border/50 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">Deployment Summary</p>
                {[["Name", form.name || "—"], ["Type", form.type.replace(/_/g, " ")], ["Replicas", form.replicas], ["CPU", form.cpuLimit], ["Memory", form.memLimit], ["Region", form.region]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
              </div>
              {deploying && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Deploying...</span><span className="text-primary">{deployProgress}%</span></div>
                  <div className="h-2 bg-muted rounded-full"><div className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full transition-all" style={{ width: `${deployProgress}%` }} /></div>
                  <div className="bg-black/50 rounded-xl p-4 font-mono text-xs space-y-1 max-h-32 overflow-auto">
                    {deployLog.map((log, i) => <p key={i} className="text-green-400">{log}</p>)}
                    {deploying && deployLog.length < 6 && <p className="text-muted-foreground animate-pulse">▌</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {step > 1 ? "Back" : "Cancel"}
          </button>
          <button onClick={() => step < 3 ? setStep(s => s + 1) : handleDeploy()}
            disabled={deploying || (step === 1 && !form.name)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {deploying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {step < 3 ? "Next" : deploying ? "Deploying..." : "Deploy Now"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DeploymentsClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_DEPLOYMENTS.filter(d => {
    const ms = search.toLowerCase();
    return (d.name.toLowerCase().includes(ms) || d.type.toLowerCase().includes(ms)) &&
      (statusFilter === "ALL" || d.status === statusFilter);
  });

  const stats = {
    total: MOCK_DEPLOYMENTS.length,
    running: MOCK_DEPLOYMENTS.filter(d => d.status === "RUNNING").length,
    stopped: MOCK_DEPLOYMENTS.filter(d => d.status === "STOPPED").length,
    failed: MOCK_DEPLOYMENTS.filter(d => d.status === "FAILED").length,
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>{showCreate && <CreateDeploymentModal onClose={() => setShowCreate(false)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Deployments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage edge services, API endpoints, and workers</p></div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> New Deployment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Running", value: stats.running, color: "text-green-400" },
          { label: "Stopped", value: stats.stopped, color: "text-slate-400" },
          { label: "Failed", value: stats.failed, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deployments..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
          <option value="ALL">All Status</option>
          {["RUNNING", "STOPPED", "FAILED", "UPDATING", "PENDING"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((dep, i) => (
          <motion.div key={dep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-xl glow-border overflow-hidden">
            <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === dep.id ? null : dep.id)}>
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl flex-shrink-0">{TYPE_ICONS[dep.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm">{dep.name}</p>
                  <span className="text-xs text-muted-foreground">{dep.version}</span>
                  {dep.url && <a href={dep.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Globe className="w-3 h-3" />{dep.url.replace("https://", "")}</a>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{dep.type.replace(/_/g, " ")}</span>
                  <span>·</span>
                  <span>{dep.replicas} replica{dep.replicas > 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{dep.region}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
                <div className="text-center"><p className="text-foreground font-medium">{dep.cpuUsage}%</p><p>CPU</p></div>
                <div className="text-center"><p className="text-foreground font-medium">{dep.memUsage}%</p><p>MEM</p></div>
                <div className="text-center"><p className="text-foreground font-medium">{dep.requestsPerMin.toLocaleString()}</p><p>req/min</p></div>
                <div className="text-center"><p className={dep.errorRate > 1 ? "text-red-400 font-medium" : "text-green-400 font-medium"}>{dep.errorRate}%</p><p>errors</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getStatusColor(dep.status), "border-current/20")}>{dep.status}</span>
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); toast.info(dep.status === "RUNNING" ? "Stopping..." : "Starting..."); }}
                    className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                    {dep.status === "RUNNING" ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); toast.info("Restarting..."); }}
                    className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded === dep.id && "rotate-180")} />
              </div>
            </div>
            <AnimatePresence>
              {expanded === dep.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border/40">
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Resource Usage (24h)</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={Array.from({ length: 24 }, (_, j) => ({ t: `${j}h`, cpu: Math.floor(dep.cpuUsage + (Math.random() - 0.5) * 20), mem: Math.floor(dep.memUsage + (Math.random() - 0.5) * 15) }))}>
                          <defs>
                            <linearGradient id={`cpu_${dep.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} /><stop offset="95%" stopColor="#00D4FF" stopOpacity={0} /></linearGradient>
                          </defs>
                          <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={5} />
                          <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                          <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "8px", fontSize: "10px" }} />
                          <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#00D4FF" fill={`url(#cpu_${dep.id})`} strokeWidth={1.5} dot={false} />
                          <Area type="monotone" dataKey="mem" name="MEM %" stroke="#7C3AED" fill="none" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Live Logs</p>
                      <div className="bg-black/60 rounded-xl p-3 font-mono text-xs text-green-400 h-[120px] overflow-auto space-y-1">
                        {Array.from({ length: 8 }, (_, j) => (
                          <p key={j} className="leading-relaxed">
                            <span className="text-muted-foreground/60">{new Date(Date.now() - j * 8000).toTimeString().slice(0, 8)}</span>
                            {" "}{["[INFO] Request processed in 28ms", "[INFO] Health check passed", "[WARN] Memory usage at 78%", "[INFO] Auto-scaled to 3 replicas", "[DEBUG] Cache hit ratio: 94%"][j % 5]}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-2 flex gap-2 flex-wrap">
                      {[{ icon: <Terminal className="w-3.5 h-3.5" />, label: "Shell" }, { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Metrics" }, { icon: <Settings className="w-3.5 h-3.5" />, label: "Config" }, { icon: <Trash2 className="w-3.5 h-3.5" />, label: "Delete" }].map((a, j) => (
                        <button key={j} onClick={() => toast.info(`${a.label} — coming in full deploy`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                          {a.icon}{a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
