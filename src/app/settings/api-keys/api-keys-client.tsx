"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Key, Plus, Copy, Trash2, X, Check, Eye, EyeOff, RefreshCw, Clock, Shield } from "lucide-react";

const PERMISSIONS = ["devices:read","devices:write","models:read","models:write","deployments:read","deployments:write","analytics:read","automations:read","automations:write","webhooks:read","webhooks:write","team:read","team:write"];

interface ApiKey { id:string; name:string; prefix:string; permissions:string[]; lastUsed?:string; expiresAt?:string; createdAt:string; }

export default function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", permissions:["devices:read","models:read"], environment:"live", expiresAt:"" });
  const [createdKey, setCreatedKey] = useState<string|null>(null);
  const [revealed, setRevealed] = useState<Record<string,boolean>>({});

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      setKeys(data.keys||[]);
    } catch { toast.error("Failed to load API keys"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const togglePerm = (p:string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p) ? prev.permissions.filter(x=>x!==p) : [...prev.permissions, p]
    }));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Key name is required"); return; }
    if (form.permissions.length === 0) { toast.error("Select at least one permission"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/api-keys", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:form.name, permissions:form.permissions, environment:form.environment, expiresAt:form.expiresAt||null }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      const data = await res.json();
      setCreatedKey(data.fullKey);
      fetchKeys();
    } catch (e:any) { toast.error(e.message||"Failed to create key"); }
    finally { setSaving(false); }
  };

  const handleRevoke = async (id:string) => {
    try {
      const res = await fetch(`/api/api-keys/${id}`, {method:"DELETE"});
      if (!res.ok) throw new Error("Failed");
      toast.success("Key revoked");
      fetchKeys();
    } catch { toast.error("Failed to revoke key"); }
  };

  const copyToClipboard = async (text:string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const maskKey = (prefix:string) => `${prefix}${"•".repeat(24)}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">{keys.length} key{keys.length!==1?"s":""} · Use these to authenticate API requests</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchKeys} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={()=>{setShowNew(true);setCreatedKey(null)}} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5"/> New Key
          </button>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>
        <div className="text-xs text-amber-200/80">
          <span className="font-semibold text-amber-400">Security: </span>
          API keys are shown only once upon creation. Store them securely (e.g. environment variables). Keys are prefixed <code className="bg-black/30 px-1 rounded">ag_live_</code> for production and <code className="bg-black/30 px-1 rounded">ag_test_</code> for development.
        </div>
      </div>

      {/* Key list */}
      {loading ? (
        <div className="space-y-3">{Array(2).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-24"/>)}</div>
      ) : keys.length===0 ? (
        <div className="text-center py-16">
          <Key className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30"/>
          <p className="text-white font-semibold mb-1">No API keys yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first key to start making API requests</p>
          <button onClick={()=>setShowNew(true)} className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg">+ Create Key</button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map(key=>(
            <div key={key.id} className="glass rounded-2xl p-5 glow-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Key className="w-4 h-4 text-cyan-400"/></div>
                  <div>
                    <p className="text-sm font-bold text-white">{key.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[10px] font-mono text-muted-foreground">{maskKey(key.prefix)}</code>
                      <button onClick={()=>copyToClipboard(key.prefix)} className="text-[10px] text-cyan-400 hover:text-cyan-300"><Copy className="w-3 h-3"/></button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleRevoke(key.id)} className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-2.5 py-1.5 rounded-lg transition-all">
                    <Trash2 className="w-3 h-3"/> Revoke
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {key.permissions.map(p=>(
                  <span key={p} className="text-[9px] font-mono bg-muted/40 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded">{p}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Created {new Date(key.createdAt).toLocaleDateString()}</span>
                {key.lastUsed && <span>Last used {new Date(key.lastUsed).toLocaleDateString()}</span>}
                {key.expiresAt && <span className="text-amber-400">Expires {new Date(key.expiresAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Key Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>{if(!createdKey)setShowNew(false)}}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">{createdKey?"Key Created!":"New API Key"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{createdKey?"Copy your key now — it won't be shown again":"Configure permissions for your new key"}</p>
              </div>
              <button onClick={()=>{setShowNew(false);setCreatedKey(null);setForm({name:"",permissions:["devices:read","models:read"],environment:"live",expiresAt:""})}} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="bg-green-400/5 border border-green-400/30 rounded-xl p-4">
                  <p className="text-xs text-green-400 font-semibold mb-2">Your new API key:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-white bg-black/30 px-3 py-2 rounded-lg break-all">{createdKey}</code>
                    <button onClick={()=>copyToClipboard(createdKey)} className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all shrink-0">
                      <Copy className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5"/> Store this key securely. You won't be able to view it again.
                </p>
                <button onClick={()=>{setShowNew(false);setCreatedKey(null);setForm({name:"",permissions:["devices:read","models:read"],environment:"live",expiresAt:""})}}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Check className="w-4 h-4"/> Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Key Name *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Production Backend"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Environment</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{v:"live",l:"Production (ag_live_)"},{v:"test",l:"Development (ag_test_)"}].map(e=>(
                      <button key={e.v} onClick={()=>setForm(p=>({...p,environment:e.v}))}
                        className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.environment===e.v?"border-cyan-400 bg-cyan-400/10 text-cyan-400":"border-border/30 text-muted-foreground"}`}>
                        {e.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Permissions *</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {PERMISSIONS.map(p=>(
                      <button key={p} onClick={()=>togglePerm(p)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[10px] font-mono transition-all ${form.permissions.includes(p)?"bg-cyan-500/15 text-cyan-400 border border-cyan-400/30":"bg-muted/20 text-muted-foreground border border-border/20 hover:border-cyan-400/20"}`}>
                        <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${form.permissions.includes(p)?"border-cyan-400 bg-cyan-400":"border-muted-foreground"}`}>
                          {form.permissions.includes(p)&&<Check className="w-2 h-2 text-black"/>}
                        </div>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Expiry Date (optional)</label>
                  <input type="date" value={form.expiresAt} onChange={e=>setForm(p=>({...p,expiresAt:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50"/>
                </div>
                <button onClick={handleCreate} disabled={saving}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Generating...</>:<><Key className="w-4 h-4"/>Generate Key</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
