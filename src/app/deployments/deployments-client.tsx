"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Server, Plus, Search, X, Check, RefreshCw, Zap, Cpu, MemoryStick, Globe, AlertCircle, Play, Square, Trash2, ChevronDown } from "lucide-react";

const DEPLOY_TYPES = ["API_SERVICE","MODEL_SERVING","WEB_APP","BACKGROUND_WORKER","DATA_PIPELINE","EDGE_FUNCTION"] as const;
const REGIONS = ["us-east-1","us-west-2","eu-west-1","eu-central-1","ap-southeast-1","ap-northeast-1"] as const;
const STATUSES = ["ALL","RUNNING","STOPPED","FAILED","UPDATING","PENDING"] as const;

const TYPE_LABELS: Record<string,string> = {
  API_SERVICE:"API Service",MODEL_SERVING:"Model Serving",WEB_APP:"Web App",
  BACKGROUND_WORKER:"Background Worker",DATA_PIPELINE:"Data Pipeline",EDGE_FUNCTION:"Edge Function",
};

const STATUS_COLORS: Record<string,string> = {
  RUNNING:"text-green-400 bg-green-400/10",STOPPED:"text-slate-400 bg-slate-400/10",
  FAILED:"text-red-400 bg-red-400/10",UPDATING:"text-amber-400 bg-amber-400/10",
  PENDING:"text-blue-400 bg-blue-400/10",DEPLOYING:"text-cyan-400 bg-cyan-400/10",
};

interface Deployment {
  id:string; name:string; type:string; status:string; url?:string; region?:string;
  replicas:number; cpuLimit?:string; memoryLimit?:string;
  cpuUsage?:number; memoryUsage?:number; reqPerMin?:number; errorRate?:number;
  modelId?:string; model?:{name:string;type:string}; createdAt:string;
}

export default function DeploymentsClient() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [form, setForm] = useState({ name:"", type:"API_SERVICE", modelId:"", replicas:"1", region:"us-east-1", cpuLimit:"500m", memoryLimit:"512Mi" });

  const fetchData = useCallback(async () => {
    try {
      const [dRes, mRes] = await Promise.all([fetch("/api/deployments"), fetch("/api/ai-models?limit=50")]);
      const dData = await dRes.json(); const mData = await mRes.json();
      setDeployments(dData.deployments || []);
      setModels((mData.models||[]).filter((m:any)=>["TRAINED","DEPLOYED"].includes(m.status)));
    } catch { toast.error("Failed to load deployments"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = deployments.filter(d =>
    (statusFilter === "ALL" || d.status === statusFilter) &&
    (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!form.name.trim() || !form.type) { toast.error("Name and type are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/deployments", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:form.name, type:form.type, modelId:form.modelId||undefined, replicas:parseInt(form.replicas)||1, region:form.region, cpuLimit:form.cpuLimit, memoryLimit:form.memoryLimit }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      toast.success("Deployment created!");
      setShowNew(false);
      setForm({ name:"", type:"API_SERVICE", modelId:"", replicas:"1", region:"us-east-1", cpuLimit:"500m", memoryLimit:"512Mi" });
      fetchData();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleAction = async (id:string, action:"stop"|"start"|"delete") => {
    try {
      if (action === "delete") {
        const res = await fetch(`/api/deployments/${id}`, {method:"DELETE"});
        if (!res.ok) throw new Error("Failed");
        toast.success("Deployment deleted"); fetchData(); return;
      }
      const status = action === "stop" ? "STOPPED" : "RUNNING";
      const res = await fetch(`/api/deployments/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Deployment ${action}ped`); fetchData();
    } catch { toast.error("Action failed"); }
  };

  const stats = {
    running: deployments.filter(d=>d.status==="RUNNING").length,
    updating: deployments.filter(d=>d.status==="UPDATING").length,
    failed: deployments.filter(d=>d.status==="FAILED").length,
    totalReq: deployments.filter(d=>d.status==="RUNNING").reduce((a,d)=>a+(d.reqPerMin||0),0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Deployments</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.running} running · {stats.totalReq.toLocaleString()} req/min · {stats.failed} failed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5"/> New Deployment
          </button>
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {label:"Running",value:stats.running,color:"text-green-400"},
          {label:"Updating",value:stats.updating,color:"text-amber-400"},
          {label:"Failed",value:stats.failed,color:"text-red-400"},
          {label:"Req/min Total",value:stats.totalReq.toLocaleString(),color:"text-cyan-400"},
        ].map((s,i)=>(
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search deployments..."
            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
        </div>
        <div className="flex gap-1 border border-border/30 rounded-lg p-1">
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${statusFilter===s?"bg-cyan-500/20 text-cyan-400":"text-muted-foreground hover:text-white"}`}>
              {s==="ALL"?"All":s}
            </button>
          ))}
        </div>
      </div>

      {/* Deployment cards */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-24"/>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16">
          <Server className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30"/>
          <p className="text-white font-semibold mb-1">No deployments yet</p>
          <p className="text-sm text-muted-foreground mb-4">Deploy AI models and services to your edge infrastructure</p>
          <button onClick={()=>setShowNew(true)} className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg">+ New Deployment</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(dep=>{
            const sc = STATUS_COLORS[dep.status]||STATUS_COLORS.PENDING;
            return (
              <div key={dep.id} className="glass rounded-2xl p-5 glow-border hover:border-cyan-400/30 transition-all">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center"><Server className="w-5 h-5 text-cyan-400"/></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{dep.name}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${sc}`}>{dep.status}</span>
                        <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{TYPE_LABELS[dep.type]||dep.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                        {dep.region && <span className="flex items-center gap-1"><Globe className="w-3 h-3"/>{dep.region}</span>}
                        <span>{dep.replicas} replica{dep.replicas!==1?"s":""}</span>
                        {dep.model && <span className="flex items-center gap-1">📦 {dep.model.name}</span>}
                        {dep.url && <a href={dep.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate max-w-[150px]">{dep.url}</a>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dep.status==="RUNNING" && (
                      <button onClick={()=>handleAction(dep.id,"stop")} className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all" title="Stop">
                        <Square className="w-3.5 h-3.5"/>
                      </button>
                    )}
                    {dep.status==="STOPPED" && (
                      <button onClick={()=>handleAction(dep.id,"start")} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all" title="Start">
                        <Play className="w-3.5 h-3.5"/>
                      </button>
                    )}
                    <button onClick={()=>handleAction(dep.id,"delete")} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
                {dep.status==="RUNNING" && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {[
                      {label:"CPU",value:`${Math.round(dep.cpuUsage||0)}%`,color:"text-cyan-400",pct:dep.cpuUsage||0},
                      {label:"Memory",value:`${Math.round(dep.memoryUsage||0)}%`,color:"text-violet-400",pct:dep.memoryUsage||0},
                      {label:"Req/min",value:(dep.reqPerMin||0).toLocaleString(),color:"text-amber-400",pct:null},
                      {label:"Error Rate",value:`${(dep.errorRate||0).toFixed(2)}%`,color:dep.errorRate&&dep.errorRate>1?"text-red-400":"text-green-400",pct:null},
                    ].map((m,i)=>(
                      <div key={i} className="glass rounded-xl p-3">
                        <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                        <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
                        {m.pct!==null && <div className="mt-1.5 h-1 bg-muted rounded-full"><div className={`h-full rounded-full`} style={{width:`${m.pct}%`,backgroundColor:m.color.replace("text-","").replace("-400","").includes("cyan")?"#00d4ff":m.color.includes("violet")?"#7c3aed":"#f59e0b"}}/></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Deployment Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowNew(false)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">New Deployment</h2><p className="text-xs text-muted-foreground mt-1">Deploy a service or AI model to your infrastructure</p></div>
              <button onClick={()=>setShowNew(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deployment Name *</label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Object Detection API"
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Deployment Type *</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50">
                  {DEPLOY_TYPES.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              {(form.type==="MODEL_SERVING"||form.type==="API_SERVICE") && models.length>0 && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Link AI Model (optional)</label>
                  <select value={form.modelId} onChange={e=>setForm(p=>({...p,modelId:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50">
                    <option value="">No model (custom service)</option>
                    {models.map(m=><option key={m.id} value={m.id}>{m.name} v{m.version}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Region</label>
                  <select value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50">
                    {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Replicas</label>
                  <input value={form.replicas} onChange={e=>setForm(p=>({...p,replicas:e.target.value}))} type="number" min="1" max="20"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">CPU Limit</label>
                  <input value={form.cpuLimit} onChange={e=>setForm(p=>({...p,cpuLimit:e.target.value}))} placeholder="500m"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Memory Limit</label>
                  <input value={form.memoryLimit} onChange={e=>setForm(p=>({...p,memoryLimit:e.target.value}))} placeholder="512Mi"
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400/50"/>
                </div>
              </div>
              <button onClick={handleCreate} disabled={saving}
                className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Deploying...</>:<><Check className="w-4 h-4"/>Deploy</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
