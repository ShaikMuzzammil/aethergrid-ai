"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw, Check, X, Shield, Clock, Activity } from "lucide-react";
import { cn, generateApiKey, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ApiKey { id: string; name: string; key: string; permissions: string[]; lastUsed: Date | null; expiresAt: Date | null; createdAt: Date; requests: number; }

const MOCK_KEYS: ApiKey[] = [
  { id: "k1", name: "Production API", key: "ag_live_Kx9mP2nQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK", permissions: ["read", "write", "devices"], lastUsed: new Date(), expiresAt: null, createdAt: new Date(Date.now() - 30 * 86400000), requests: 184200 },
  { id: "k2", name: "Analytics Dashboard", key: "ag_live_Lz8oN3mP5qR7sT9uV1wX3yB5cD7eF9gH1iJ3kL", permissions: ["read", "analytics"], lastUsed: new Date(Date.now() - 3600000), expiresAt: new Date(Date.now() + 90 * 86400000), createdAt: new Date(Date.now() - 15 * 86400000), requests: 4520 },
  { id: "k3", name: "CI/CD Pipeline", key: "ag_live_Mn7nL2lO4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI", permissions: ["read", "write", "deploy"], lastUsed: new Date(Date.now() - 86400000), expiresAt: null, createdAt: new Date(Date.now() - 60 * 86400000), requests: 8910 },
];

const PERMISSION_OPTIONS = [
  { id: "read", label: "Read", desc: "Read all resources" },
  { id: "write", label: "Write", desc: "Create and update resources" },
  { id: "delete", label: "Delete", desc: "Delete resources" },
  { id: "devices", label: "Devices", desc: "Manage IoT devices" },
  { id: "models", label: "Models", desc: "Manage AI models" },
  { id: "deploy", label: "Deploy", desc: "Create deployments" },
  { id: "analytics", label: "Analytics", desc: "Access analytics data" },
  { id: "admin", label: "Admin", desc: "Full administrative access" },
];

function CreateKeyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (key: ApiKey) => void }) {
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<string[]>(["read"]);
  const [expiry, setExpiry] = useState("never");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function togglePerm(p: string) { setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]); }

  async function handleCreate() {
    setCreating(true);
    await new Promise(r => setTimeout(r, 700));
    const newKey = generateApiKey();
    setCreated(newKey);
    onCreate({
      id: `k_${Date.now()}`, name, key: newKey, permissions: perms,
      lastUsed: null, expiresAt: expiry !== "never" ? new Date(Date.now() + parseInt(expiry) * 86400000) : null,
      createdAt: new Date(), requests: 0,
    });
    setCreating(false);
  }

  async function copyKey() {
    if (created) { await navigator.clipboard.writeText(created); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("API key copied!"); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-bold text-foreground">{created ? "API Key Created" : "Create API Key"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          {!created ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Key Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Production API, CI/CD Pipeline"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSION_OPTIONS.map(p => (
                    <button key={p.id} onClick={() => togglePerm(p.id)}
                      className={cn("flex items-start gap-2 p-3 rounded-xl border text-left transition-all", perms.includes(p.id) ? "border-primary/50 bg-primary/8 text-primary" : "border-border/50 hover:border-border text-muted-foreground hover:bg-muted/20")}>
                      <div className={cn("w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-all", perms.includes(p.id) ? "bg-primary border-primary" : "border-border")}>
                        {perms.includes(p.id) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <div><p className="text-xs font-medium leading-tight">{p.label}</p><p className="text-[10px] opacity-70 mt-0.5 leading-tight">{p.desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expiration</label>
                <select value={expiry} onChange={e => setExpiry(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                  <option value="never">Never expires</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 border border-yellow-400/30 bg-yellow-400/5">
                <p className="text-xs text-yellow-400 font-medium mb-2">⚠️ Copy this key now — it won't be shown again!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-green-400 font-mono bg-black/30 rounded-lg px-3 py-2.5 break-all">{created}</code>
                  <button onClick={copyKey} className={cn("p-2 rounded-lg transition-all flex-shrink-0", copied ? "bg-green-400/20 text-green-400" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground")}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button onClick={copyKey}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary/40 rounded-xl text-sm text-primary hover:bg-primary/10 transition-all">
                <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">{created ? "Done" : "Cancel"}</button>
          {!created && (
            <button onClick={handleCreate} disabled={creating || !name || perms.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
              {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {creating ? "Creating..." : "Create Key"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  function toggleVisibility(id: string) {
    setVisibleKeys(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function maskKey(key: string) { return key.slice(0, 12) + "••••••••••••••••••••" + key.slice(-4); }

  async function revokeKey(id: string) {
    setKeys(prev => prev.filter(k => k.id !== id));
    toast.success("API key revoked");
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AnimatePresence>{showCreate && <CreateKeyModal onClose={() => setShowCreate(false)} onCreate={k => setKeys(p => [k, ...p])} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage programmatic access to your AetherGrid account</p></div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> Create API Key
        </button>
      </div>

      <div className="glass rounded-xl p-4 border border-yellow-400/20 bg-yellow-400/5 flex items-start gap-3">
        <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-400">Keep your API keys secure</p>
          <p className="text-xs text-muted-foreground mt-0.5">Never share your API keys in public repositories, client-side code, or unsecured environments. Rotate keys regularly.</p>
        </div>
      </div>

      <div className="space-y-4">
        {keys.map((key, i) => (
          <motion.div key={key.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass rounded-xl p-5 glow-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{key.name}</p>
                  <p className="text-xs text-muted-foreground">Created {formatDate(key.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => revokeKey(key.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 text-xs text-green-400 font-mono bg-black/30 rounded-lg px-3 py-2.5 overflow-hidden">
                {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
              </code>
              <button onClick={() => toggleVisibility(key.id)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                {visibleKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => copyKey(key.key)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {key.permissions.map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium uppercase tracking-wider">{p}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{key.requests.toLocaleString()} requests</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {key.lastUsed ? "just now" : "Never"}</span>
                {key.expiresAt && <span className="text-yellow-400">Expires {formatDate(key.expiresAt)}</span>}
                {!key.expiresAt && <span className="text-green-400">Never expires</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 glow-border">
        <h3 className="font-semibold text-foreground mb-4">Quick Start — Using Your API Key</h3>
        <div className="space-y-3">
          {[
            { label: "cURL", code: `curl -H "Authorization: Bearer ag_live_YOUR_KEY" \\\n  https://api.aethergrid.ai/v1/devices` },
            { label: "JavaScript", code: `const res = await fetch('https://api.aethergrid.ai/v1/devices', {\n  headers: { 'Authorization': 'Bearer ag_live_YOUR_KEY' }\n});` },
            { label: "Python", code: `import requests\nres = requests.get(\n  'https://api.aethergrid.ai/v1/devices',\n  headers={'Authorization': 'Bearer ag_live_YOUR_KEY'}\n)` },
          ].map(ex => (
            <div key={ex.label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground">{ex.label}</p>
                <button onClick={() => { navigator.clipboard.writeText(ex.code); toast.success("Copied!"); }} className="text-xs text-primary hover:underline flex items-center gap-1"><Copy className="w-3 h-3" />Copy</button>
              </div>
              <pre className="bg-black/50 rounded-xl p-3 text-xs font-mono text-green-400 overflow-x-auto">{ex.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
