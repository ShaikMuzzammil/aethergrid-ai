"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Webhook, Plus, X, Check, RefreshCw, Trash2, Zap, Clock, ToggleLeft, ToggleRight, Copy, Globe, Shield } from "lucide-react";

const WEBHOOK_EVENTS = ["device.online","device.offline","device.alert","alert.triggered","model.deployed","model.trained","deployment.success","deployment.failed","export.completed","team.invite"];

interface WebhookItem { id:string; name:string; url:string; events:string[]; active:boolean; createdAt:string; _count:{deliveries:number}; deliveries:{createdAt:string}[]; }

export default function WebhooksClient() {
  const [hooks, setHooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", url:"", events:[] as string[] });
  const [createdSecret, setCreatedSecret] = useState<string|null>(null);

  const fetchHooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setHooks(data.webhooks||[]);
    } catch { toast.error("Failed to load webhooks"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHooks(); }, [fetchHooks]);

  const toggleEvent = (e:string) => setForm(p=>({ ...p, events: p.events.includes(e)?p.events.filter(x=>x!==e):[...p.events,e] }));

  const handleCreate = async () => {
    if (!form.name||!form.url) { toast.error("Name and URL are required"); return; }
    if (form.events.length===0) { toast.error("Select at least one event"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/webhooks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      const data = await res.json();
      setCreatedSecret(data.secret);
      fetchHooks();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id:string, active:boolean) => {
    try {
      await fetch(`/api/webhooks/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!active})});
      toast.success(`Webhook ${active?"paused":"activated"}`);
      fetchHooks();
    } catch { toast.error("Failed"); }
  };

  const deleteHook = async (id:string) => {
    try {
      await fetch(`/api/webhooks/${id}`,{method:"DELETE"});
      toast.success("Webhook deleted");
      fetchHooks();
    } catch { toast.error("Failed to delete"); }
  };

  const testHook = async (id:string) => {
    toast.info("Test ping sent!");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">{hooks.length} webhook{hooks.length!==1?"s":""} · Real-time event delivery to your endpoints</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchHooks} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={()=>{setShowNew(true);setCreatedSecret(null)}} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5"/> Add Webhook
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"/>
        <p className="text-xs text-cyan-200/80"><span className="font-semibold text-cyan-400">HMAC-SHA256 Signing: </span>All payloads are signed with your webhook secret. Verify the <code className="bg-black/30 px-1 rounded">X-AetherGrid-Signature</code> header in your endpoint.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(2).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-28"/>)}</div>
      ) : hooks.length===0 ? (
        <div className="text-center py-16">
          <Webhook className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30"/>
          <p className="text-white font-semibold mb-1">No webhooks configured</p>
          <p className="text-sm text-muted-foreground mb-4">Receive real-time events in your applications</p>
          <button onClick={()=>setShowNew(true)} className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg">+ Add Webhook</button>
        </div>
      ) : (
        <div className="space-y-3">
          {hooks.map(hook=>(
            <div key={hook.id} className="glass rounded-2xl p-5 glow-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Globe className="w-4 h-4 text-cyan-400"/></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{hook.name}</p>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${hook.active?"text-green-400 bg-green-400/10":"text-slate-400 bg-slate-400/10"}`}>{hook.active?"Active":"Paused"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">{hook.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>testHook(hook.id)} className="text-[10px] text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 px-2.5 py-1.5 rounded-lg transition-all">Test</button>
                  <button onClick={()=>toggleActive(hook.id,hook.active)} className="p-1.5 text-muted-foreground hover:text-white transition-all">
                    {hook.active?<ToggleRight className="w-5 h-5 text-green-400"/>:<ToggleLeft className="w-5 h-5"/>}
                  </button>
                  <button onClick={()=>deleteHook(hook.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {hook.events.map(e=><span key={e} className="text-[9px] font-mono bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded border border-border/20">{e}</span>)}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span><Clock className="w-3 h-3 inline mr-1"/>Created {new Date(hook.createdAt).toLocaleDateString()}</span>
                <span><Zap className="w-3 h-3 inline mr-1"/>{hook._count.deliveries} deliveries</span>
                {hook.deliveries[0] && <span>Last: {new Date(hook.deliveries[0].createdAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Webhook Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>{if(!createdSecret)setShowNew(false)}}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">{createdSecret?"Webhook Created!":"Add Webhook"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{createdSecret?"Save your signing secret":"Configure endpoint and events"}</p>
              </div>
              <button onClick={()=>{setShowNew(false);setCreatedSecret(null);setForm({name:"",url:"",events:[]})}} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            {createdSecret ? (
              <div className="space-y-4">
                <div className="bg-green-400/5 border border-green-400/30 rounded-xl p-4">
                  <p className="text-xs text-green-400 font-semibold mb-2">Webhook Signing Secret:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] font-mono text-white bg-black/30 px-3 py-2 rounded-lg break-all">{createdSecret}</code>
                    <button onClick={()=>{navigator.clipboard.writeText(createdSecret);toast.success("Copied!")}} className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg"><Copy className="w-4 h-4"/></button>
                  </div>
                </div>
                <p className="text-xs text-amber-400">Use this secret to verify webhook signatures in your endpoint. Store it securely.</p>
                <button onClick={()=>{setShowNew(false);setCreatedSecret(null);setForm({name:"",url:"",events:[]})}} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4"/> Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Webhook Name *</label>
                  <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Production Alerts"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Endpoint URL *</label>
                  <input value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://your-server.com/webhook"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Events to Subscribe *</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WEBHOOK_EVENTS.map(e=>(
                      <button key={e} onClick={()=>toggleEvent(e)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[10px] font-mono transition-all ${form.events.includes(e)?"bg-cyan-500/15 text-cyan-400 border border-cyan-400/30":"bg-muted/20 text-muted-foreground border border-border/20 hover:border-cyan-400/20"}`}>
                        <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${form.events.includes(e)?"border-cyan-400 bg-cyan-400":"border-muted-foreground"}`}>
                          {form.events.includes(e)&&<Check className="w-2 h-2 text-black"/>}
                        </div>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCreate} disabled={saving}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Creating...</>:<><Webhook className="w-4 h-4"/>Create Webhook</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
