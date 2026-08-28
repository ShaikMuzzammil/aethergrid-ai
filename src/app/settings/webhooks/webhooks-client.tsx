"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Webhook, Plus, Trash2, CheckCircle, RefreshCw, X, ToggleLeft, ToggleRight, Copy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WEBHOOK_EVENTS = [
  "device.online", "device.offline", "device.alert", "device.command",
  "model.training_complete", "model.training_failed", "model.deployed",
  "deployment.started", "deployment.success", "deployment.failed",
  "export.complete", "alert.triggered", "alert.resolved",
];

interface WebhookItem { id: string; name: string; url: string; events: string[]; active: boolean; deliveries: number; lastDelivery: string; successRate: number; }

const MOCK_WEBHOOKS: WebhookItem[] = [
  { id: "wh1", name: "Production Alerts", url: "https://hooks.slack.com/services/T00/B00/xxx", events: ["device.alert", "alert.triggered", "deployment.failed"], active: true, deliveries: 1420, lastDelivery: "2m ago", successRate: 99.2 },
  { id: "wh2", name: "CI/CD Pipeline", url: "https://api.github.com/repos/acme/edge/dispatches", events: ["model.deployed", "deployment.success"], active: true, deliveries: 234, lastDelivery: "1h ago", successRate: 100 },
  { id: "wh3", name: "Monitoring System", url: "https://events.pagerduty.com/v2/enqueue", events: ["device.offline", "alert.triggered"], active: false, deliveries: 89, lastDelivery: "3d ago", successRate: 95.5 },
];

function CreateWebhookModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[], secret: "" });
  const [saving, setSaving] = useState(false);

  function toggleEvent(e: string) { setForm(f => ({ ...f, events: f.events.includes(e) ? f.events.filter(x => x !== e) : [...f.events, e] })); }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(`Webhook "${form.name}" created!`);
    setSaving(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/60 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-md">
          <h2 className="font-bold text-foreground">Add Webhook</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Webhook Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Slack Alerts"
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Endpoint URL</label>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://your-endpoint.com/webhook" type="url"
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Secret (for signature verification)</label>
            <div className="flex gap-2">
              <input value={form.secret} onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} placeholder="Optional — leave blank to auto-generate"
                className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
              <button onClick={() => setForm(f => ({ ...f, secret: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }))}
                className="px-3 py-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all whitespace-nowrap">Generate</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Subscribe to Events ({form.events.length} selected)</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {WEBHOOK_EVENTS.map(evt => (
                <button key={evt} onClick={() => toggleEvent(evt)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-all", form.events.includes(evt) ? "border-primary/50 bg-primary/8 text-primary" : "border-border/50 hover:border-border text-muted-foreground hover:bg-muted/20")}>
                  <div className={cn("w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all", form.events.includes(evt) ? "bg-primary border-primary" : "border-border")}>
                    {form.events.includes(evt) && <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  {evt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50 sticky bottom-0 bg-card/80 backdrop-blur-md">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.url || form.events.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving..." : "Create Webhook"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WebhooksClient() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(MOCK_WEBHOOKS);
  const [showCreate, setShowCreate] = useState(false);

  function toggleWebhook(id: string) { setWebhooks(p => p.map(w => w.id === id ? { ...w, active: !w.active } : w)); }
  function deleteWebhook(id: string) { setWebhooks(p => p.filter(w => w.id !== id)); toast.success("Webhook deleted"); }

  async function testWebhook(wh: WebhookItem) {
    toast.loading("Sending test payload...");
    await new Promise(r => setTimeout(r, 1200));
    toast.dismiss(); toast.success("Test delivery sent! Check your endpoint.");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AnimatePresence>{showCreate && <CreateWebhookModal onClose={() => setShowCreate(false)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Receive real-time events to your endpoints</p></div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="glass rounded-xl p-4 border border-cyan-400/20 bg-cyan-400/5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-cyan-400">Webhook signatures</p>
          <p className="text-xs text-muted-foreground mt-0.5">All deliveries include an <code className="text-cyan-400">X-AetherGrid-Signature</code> header (HMAC-SHA256). Always verify signatures in production.</p>
        </div>
      </div>

      <div className="space-y-4">
        {webhooks.map((wh, i) => (
          <motion.div key={wh.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass rounded-xl p-5 glow-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{wh.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-xs">{wh.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", wh.active ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-slate-400/10 text-slate-400 border-slate-400/20")}>
                  {wh.active ? "Active" : "Paused"}
                </span>
                <button onClick={() => toggleWebhook(wh.id)}>
                  {wh.active ? <ToggleRight className="w-7 h-7 text-primary" /> : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {wh.events.map(evt => (
                <span key={evt} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground font-mono">{evt}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{wh.deliveries.toLocaleString()} deliveries</span>
                <span className={cn(wh.successRate >= 99 ? "text-green-400" : wh.successRate >= 95 ? "text-yellow-400" : "text-red-400")}>
                  {wh.successRate}% success
                </span>
                <span>Last: {wh.lastDelivery}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => testWebhook(_wh)} className="px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/40 hover:text-primary text-muted-foreground transition-all text-xs">Test</button>
                <button onClick={() => { navigator.clipboard.writeText(wh.url); toast.success("URL copied!"); }} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteWebhook(wh.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
