"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Zap, Plus, X, Check, RefreshCw, Trash2, Play, Pause, Edit3, Clock, Activity } from "lucide-react";

const CATEGORIES = ["ALL","MONITORING","MAINTENANCE","INTEGRATION","SCALING","REPORTING","ML_OPS","SAFETY"] as const;
const CAT_COLORS: Record<string,string> = {
  MONITORING:"text-cyan-400 bg-cyan-400/10",MAINTENANCE:"text-blue-400 bg-blue-400/10",
  INTEGRATION:"text-violet-400 bg-violet-400/10",SCALING:"text-emerald-400 bg-emerald-400/10",
  REPORTING:"text-amber-400 bg-amber-400/10",ML_OPS:"text-pink-400 bg-pink-400/10",SAFETY:"text-red-400 bg-red-400/10"
};
const TRIGGER_TYPES = ["threshold","device_offline","model_inference","schedule","version_check","metric"];
const ACTION_TYPES = ["notification","webhook","ota_update","scale_deployment","export_and_email","multi","restart_device"];
const TRIGGER_LABELS: Record<string,string> = { threshold:"Metric Threshold",device_offline:"Device Offline",model_inference:"Model Inference",schedule:"Scheduled (Cron)",version_check:"Version Check",metric:"Performance Metric" };
const ACTION_LABELS: Record<string,string> = { notification:"Send Notification",webhook:"Call Webhook",ota_update:"OTA Firmware Update",scale_deployment:"Scale Deployment",export_and_email:"Export + Email",multi:"Multiple Actions",restart_device:"Restart Device" };

interface Automation { id:string; name:string; description?:string; category:string; active:boolean; triggerType:string; triggerConfig:any; actionType:string; actionConfig:any; runCount:number; lastRun?:string; }

export default function AutomationsClient() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState({ total:0, active:0, paused:0, totalRuns:0 });
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("ALL");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", description:"", category:"MONITORING", triggerType:"threshold", actionType:"notification",
    triggerMetric:"cpu", triggerOp:">", triggerVal:"85",
    actionChannel:"slack", actionMsg:"Device {{device.name}} triggered alert" });

  const fetchAutomations = useCallback(async () => {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      setAutomations(data.automations||[]);
      setStats(data.stats||{ total:0, active:0, paused:0, totalRuns:0 });
    } catch { toast.error("Failed to load automations"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const filtered = automations.filter(a => catFilter==="ALL" || a.category===catFilter);

  const toggleActive = async (id:string, active:boolean) => {
    try {
      await fetch(`/api/automations/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!active})});
      toast.success(`Rule ${active?"paused":"activated"}`);
      fetchAutomations();
    } catch { toast.error("Failed"); }
  };

  const deleteAuto = async (id:string) => {
    try {
      await fetch(`/api/automations/${id}`,{method:"DELETE"});
      toast.success("Rule deleted");
      fetchAutomations();
    } catch { toast.error("Failed"); }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Rule name is required"); return; }
    setSaving(true);
    try {
      const triggerConfig = form.triggerType==="threshold"
        ? { metric:form.triggerMetric, operator:form.triggerOp, value:parseFloat(form.triggerVal), deviceFilter:"all" }
        : form.triggerType==="schedule"
        ? { cron:`0 8 * * *`, timezone:"UTC" }
        : { deviceFilter:"all" };
      const actionConfig = form.actionType==="notification"
        ? { channel:form.actionChannel, message:form.actionMsg }
        : form.actionType==="webhook"
        ? { url:"", method:"POST" }
        : {};
      const res = await fetch("/api/automations",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ name:form.name, description:form.description, category:form.category, triggerType:form.triggerType, triggerConfig, actionType:form.actionType, actionConfig })});
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      toast.success("Automation rule created!");
      setShowNew(false);
      setForm({ name:"",description:"",category:"MONITORING",triggerType:"threshold",actionType:"notification",triggerMetric:"cpu",triggerOp:">",triggerVal:"85",actionChannel:"slack",actionMsg:"Device {{device.name}} triggered alert" });
      fetchAutomations();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const inCls = "w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50";
  const lblCls = "text-xs font-semibold text-muted-foreground mb-1 block";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">Visual rule builder — if this, then that for your edge fleet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAutomations} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all"><RefreshCw className="w-3.5 h-3.5"/> Refresh</button>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all"><Plus className="w-3.5 h-3.5"/> New Rule</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[{label:"Total Rules",value:stats.total,color:"text-white"},{label:"Active",value:stats.active,color:"text-green-400"},{label:"Paused",value:stats.paused,color:"text-amber-400"},{label:"Total Runs",value:stats.totalRuns.toLocaleString(),color:"text-cyan-400"}].map((s,i)=>(
          <div key={i} className="glass rounded-xl p-4 text-center"><div className={`text-xl font-black ${s.color}`}>{s.value}</div><div className="text-[10px] text-muted-foreground mt-1">{s.label}</div></div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap border border-border/30 rounded-xl p-1">
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter===c?"bg-cyan-500/20 text-cyan-400":"text-muted-foreground hover:text-white"}`}>
            {c==="ALL"?"All":c.replace("_"," ")}
          </button>
        ))}
      </div>

      {/* Rules */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-28"/>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30"/>
          <p className="text-white font-semibold mb-1">No automations yet</p>
          <button onClick={()=>setShowNew(true)} className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg mt-3">+ Create First Rule</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(auto=>{
            const cc = CAT_COLORS[auto.category]||"text-muted-foreground bg-muted/20";
            return (
              <div key={auto.id} className="glass rounded-2xl p-5 glow-border hover:border-cyan-400/20 transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cc.split(" ")[1]}`}>
                      <Zap className={`w-4 h-4 ${cc.split(" ")[0]}`}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{auto.name}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cc}`}>{auto.category.replace("_"," ")}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${auto.active?"text-green-400 bg-green-400/10":"text-slate-400 bg-slate-400/10"}`}>{auto.active?"Active":"Paused"}</span>
                      </div>
                      {auto.description && <p className="text-[11px] text-muted-foreground mt-0.5">{auto.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={()=>toggleActive(auto.id,auto.active)} className={`p-1.5 rounded-lg transition-all ${auto.active?"bg-amber-500/10 hover:bg-amber-500/20 text-amber-400":"bg-green-500/10 hover:bg-green-500/20 text-green-400"}`} title={auto.active?"Pause":"Activate"}>
                      {auto.active?<Pause className="w-3.5 h-3.5"/>:<Play className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={()=>deleteAuto(auto.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground font-mono">WHEN</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{TRIGGER_LABELS[auto.triggerType]||auto.triggerType}</span>
                    {auto.triggerConfig?.metric && <span className="text-[9px] text-white font-mono">{auto.triggerConfig.metric} {auto.triggerConfig.operator} {auto.triggerConfig.value}</span>}
                  </div>
                  <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground font-mono">THEN</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{ACTION_LABELS[auto.actionType]||auto.actionType}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3"/>{auto.runCount} runs</span>
                  {auto.lastRun && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>Last run {new Date(auto.lastRun).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Rule Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowNew(false)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">New Automation Rule</h2><p className="text-xs text-muted-foreground mt-1">Define a trigger and action</p></div>
              <button onClick={()=>setShowNew(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              <div><label className={lblCls}>Rule Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. High CPU Alert" className={inCls}/></div>
              <div><label className={lblCls}>Description</label><input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What does this rule do?" className={inCls}/></div>
              <div><label className={lblCls}>Category</label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className={inCls}>
                  {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c.replace("_"," ")}</option>)}
                </select>
              </div>

              {/* Trigger */}
              <div className="p-4 bg-cyan-500/5 border border-cyan-400/20 rounded-xl space-y-3">
                <p className="text-xs font-bold text-cyan-400">WHEN (Trigger)</p>
                <div><label className={lblCls}>Trigger Type</label>
                  <select value={form.triggerType} onChange={e=>setForm(p=>({...p,triggerType:e.target.value}))} className={inCls}>
                    {TRIGGER_TYPES.map(t=><option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
                  </select>
                </div>
                {form.triggerType==="threshold" && (
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className={lblCls}>Metric</label>
                      <select value={form.triggerMetric} onChange={e=>setForm(p=>({...p,triggerMetric:e.target.value}))} className={inCls}>
                        {["cpu","memory","temperature","latency","error_rate"].map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div><label className={lblCls}>Operator</label>
                      <select value={form.triggerOp} onChange={e=>setForm(p=>({...p,triggerOp:e.target.value}))} className={inCls}>
                        {[">",">=","<","<=","=="].map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><label className={lblCls}>Value</label><input value={form.triggerVal} onChange={e=>setForm(p=>({...p,triggerVal:e.target.value}))} type="number" className={inCls}/></div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-400/20 rounded-xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">THEN (Action)</p>
                <div><label className={lblCls}>Action Type</label>
                  <select value={form.actionType} onChange={e=>setForm(p=>({...p,actionType:e.target.value}))} className={inCls}>
                    {ACTION_TYPES.map(t=><option key={t} value={t}>{ACTION_LABELS[t]}</option>)}
                  </select>
                </div>
                {form.actionType==="notification" && (
                  <div className="space-y-2">
                    <div><label className={lblCls}>Channel</label>
                      <select value={form.actionChannel} onChange={e=>setForm(p=>({...p,actionChannel:e.target.value}))} className={inCls}>
                        {["slack","email","pagerduty","sms"].map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label className={lblCls}>Message</label><input value={form.actionMsg} onChange={e=>setForm(p=>({...p,actionMsg:e.target.value}))} placeholder="Use {{device.name}}, {{device.cpu}}, etc." className={inCls}/></div>
                  </div>
                )}
              </div>

              <button onClick={handleCreate} disabled={saving}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Creating...</>:<><Zap className="w-4 h-4"/>Create Rule</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
