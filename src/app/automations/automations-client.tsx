"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Plus, Search, Play, Pause, Trash2, Edit, ChevronRight,
  AlertTriangle, Bell, Mail, Webhook, Terminal, RefreshCw,
  Check, X, Clock, Activity, ArrowRight, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_AUTOMATIONS = [
  { id: "a1", name: "High CPU Alert", enabled: true, trigger: "Device CPU > 85%", action: "Send Slack notification", runs: 142, lastRun: "2m ago", category: "Monitoring" },
  { id: "a2", name: "Auto Firmware Update", enabled: true, trigger: "Firmware version < 2.4.0", action: "Schedule OTA update in 24h", runs: 67, lastRun: "3h ago", category: "Maintenance" },
  { id: "a3", name: "Anomaly to Webhook", enabled: false, trigger: "Anomaly model confidence > 0.9", action: "POST to https://api.acme.com/alerts", runs: 891, lastRun: "1d ago", category: "Integration" },
  { id: "a4", name: "Device Offline Alert", enabled: true, trigger: "Device offline > 10 minutes", action: "Email team + create incident", runs: 23, lastRun: "5h ago", category: "Monitoring" },
  { id: "a5", name: "Scale on Load", enabled: true, trigger: "Requests/sec > 5000", action: "Scale deployment +2 replicas", runs: 8, lastRun: "2d ago", category: "Scaling" },
  { id: "a6", name: "Export Daily Report", enabled: true, trigger: "Daily at 08:00 UTC", action: "Generate CSV export + email", runs: 30, lastRun: "8h ago", category: "Reporting" },
  { id: "a7", name: "Model Retraining", enabled: false, trigger: "Model accuracy drops < 85%", action: "Queue training job", runs: 3, lastRun: "7d ago", category: "ML Ops" },
  { id: "a8", name: "Temperature Guard", enabled: true, trigger: "Device temp > 75°C", action: "Reduce workload + alert engineer", runs: 12, lastRun: "6h ago", category: "Safety" },
];

const CATEGORIES = ["All", "Monitoring", "Maintenance", "Integration", "Scaling", "Reporting", "ML Ops", "Safety"];

const TRIGGER_OPTIONS = [
  "Device CPU > threshold", "Device memory > threshold", "Device temperature > threshold",
  "Device offline > duration", "Firmware version < version", "Model accuracy < threshold",
  "Requests/sec > threshold", "Error rate > threshold", "Time-based (cron)", "Webhook received",
];

const ACTION_OPTIONS = [
  "Send Slack message", "Send email", "Send webhook", "Send SMS",
  "Create Jira ticket", "Scale deployment", "Run script", "Export data",
  "Reboot device", "Update firmware", "Queue training job", "Create alert",
];

function RuleBuilder({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", trigger: TRIGGER_OPTIONS[0], triggerValue: "", action: ACTION_OPTIONS[0], actionValue: "", enabled: true });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(`Automation "${form.name}" created!`);
    setSaving(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-bold text-foreground">Create Automation Rule</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rule Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. High CPU Alert" className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
          </div>
          {/* Visual rule builder */}
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center"><Zap className="w-3 h-3 text-yellow-400" /></div>
              <span className="text-sm font-semibold text-foreground">WHEN</span>
            </div>
            <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
              {TRIGGER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.triggerValue} onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
              placeholder="Threshold value (e.g. 85 for 85%)" className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-dashed border-border/50" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                <ArrowRight className="w-3 h-3" /> THEN
              </div>
              <div className="flex-1 border-t border-dashed border-border/50" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center"><Play className="w-3 h-3 text-cyan-400" /></div>
              <span className="text-sm font-semibold text-foreground">DO</span>
            </div>
            <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
              {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input value={form.actionValue} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}
              placeholder="Action config (URL, message, channel...)" className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium text-foreground">Enable immediately</p>
              <p className="text-xs text-muted-foreground">Rule will start running right after creation</p></div>
            <button onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}>
              {form.enabled ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving..." : "Create Rule"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AutomationsClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  const filtered = automations.filter(a =>
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.trigger.toLowerCase().includes(search.toLowerCase())) &&
    (category === "All" || a.category === category)
  );

  function toggleAutomation(id: string) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{showCreate && <RuleBuilder onClose={() => setShowCreate(false)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visual rule builder — if this, then that for your edge fleet</p></div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Rules", value: automations.length, color: "text-foreground" },
          { label: "Active", value: automations.filter(a => a.enabled).length, color: "text-green-400" },
          { label: "Total Runs", value: automations.reduce((s, a) => s + a.runs, 0).toLocaleString(), color: "text-cyan-400" },
          { label: "Paused", value: automations.filter(a => !a.enabled).length, color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", category === cat ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rule, i) => (
          <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={cn("glass rounded-xl p-5 glow-border transition-all", !rule.enabled && "opacity-60")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="font-semibold text-foreground text-sm">{rule.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground">{rule.category}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", rule.enabled ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-slate-400/10 text-slate-400 border-slate-400/20")}>
                    {rule.enabled ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="flex-1 glass rounded-xl p-3">
                    <p className="text-xs text-yellow-400 font-medium mb-1">⚡ WHEN</p>
                    <p className="text-xs text-muted-foreground">{rule.trigger}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 flex-shrink-0" />
                  <div className="flex-1 glass rounded-xl p-3">
                    <p className="text-xs text-cyan-400 font-medium mb-1">▶ THEN</p>
                    <p className="text-xs text-muted-foreground">{rule.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{rule.runs} runs</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {rule.lastRun}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAutomation(rule.id)}>
                  {rule.enabled ? <ToggleRight className="w-7 h-7 text-primary" /> : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                </button>
                <button onClick={() => toast.info("Edit coming soon")} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setAutomations(p => p.filter(a => a.id !== rule.id)); toast.success("Rule deleted"); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
