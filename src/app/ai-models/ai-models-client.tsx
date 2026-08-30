"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Brain, Plus, Search, Upload, X, Check, ChevronRight, Zap, Cpu, HardDrive, Activity, Trash2, RefreshCw, Play, Archive } from "lucide-react";

const MODEL_TYPES = ["OBJECT_DETECTION","IMAGE_SEGMENTATION","CLASSIFICATION","ANOMALY_DETECTION","NLP","TIME_SERIES","RECOMMENDATION","GENERATIVE"] as const;
const FRAMEWORKS = ["TENSORFLOW","PYTORCH","ONNX","TFLITE","OPENVINO","CUSTOM"] as const;
const STATUSES = ["ALL","DRAFT","TRAINING","TRAINED","DEPLOYED","ARCHIVED"] as const;

const TYPE_LABELS: Record<string, string> = {
  OBJECT_DETECTION:"Object Detection",IMAGE_SEGMENTATION:"Image Segmentation",CLASSIFICATION:"Classification",
  ANOMALY_DETECTION:"Anomaly Detection",NLP:"NLP",TIME_SERIES:"Time Series",
  RECOMMENDATION:"Recommendation",GENERATIVE:"Generative",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT:"text-slate-400 bg-slate-400/10",TRAINING:"text-amber-400 bg-amber-400/10",
  TRAINED:"text-blue-400 bg-blue-400/10",DEPLOYED:"text-green-400 bg-green-400/10",
  ARCHIVED:"text-muted-foreground bg-muted/20",
};

const FRAMEWORK_COLORS: Record<string, string> = {
  TENSORFLOW:"text-orange-400",PYTORCH:"text-red-400",ONNX:"text-purple-400",
  TFLITE:"text-green-400",OPENVINO:"text-blue-400",CUSTOM:"text-cyan-400",
};

interface AIModel {
  id:string; name:string; version:string; type:string; framework:string;
  description?:string; accuracy?:number; size?:number; latency?:number;
  status:string; tags:string[]; createdAt:string; updatedAt:string;
  trainingJobs?:Array<{status:string;progress:number}>;
  _count?:{inferenceRequests:number;deployments:number};
}

export default function AIModelsClient() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<AIModel | null>(null);
  const [form, setForm] = useState({ name:"", version:"1.0.0", type:"", framework:"", description:"", accuracy:"", latency:"", tags:"" });

  const fetchModels = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit:"50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/ai-models?${params}`);
      const data = await res.json();
      setModels(data.models || []);
    } catch { toast.error("Failed to load models"); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const filtered = models.filter(m =>
    search === "" || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase()) || m.framework.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name.trim() || !form.type || !form.framework) { toast.error("Name, type, and framework are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/ai-models", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name: form.name, version: form.version, type: form.type, framework: form.framework,
          description: form.description || undefined,
          accuracy: form.accuracy ? parseFloat(form.accuracy) : undefined,
          latency: form.latency ? parseFloat(form.latency) : undefined,
          tags: form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success("Model created successfully!");
      setShowUpload(false);
      setForm({ name:"", version:"1.0.0", type:"", framework:"", description:"", accuracy:"", latency:"", tags:"" });
      fetchModels();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id:string) => {
    try {
      const res = await fetch(`/api/ai-models/${id}`, { method:"DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Model deleted");
      setSelected(null);
      fetchModels();
    } catch { toast.error("Failed to delete model"); }
  };

  const handleStatusUpdate = async (id:string, status:string) => {
    try {
      const res = await fetch(`/api/ai-models/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Model status updated to ${status}`);
      fetchModels();
      if (selected?.id === id) setSelected(prev => prev ? {...prev, status} : null);
    } catch { toast.error("Failed to update status"); }
  };

  const fmtSize = (b?:number) => {
    if (!b) return "—";
    if (b > 1e6) return `${(b/1e6).toFixed(1)} MB`;
    return `${(b/1e3).toFixed(0)} KB`;
  };

  const stats = {
    total: models.length,
    deployed: models.filter(m=>m.status==="DEPLOYED").length,
    training: models.filter(m=>m.status==="TRAINING").length,
    trained: models.filter(m=>m.status==="TRAINED").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">AI Model Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} models · {stats.deployed} deployed · {stats.training} training</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchModels} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 text-xs bg-violet-500 hover:bg-violet-400 text-white font-bold px-4 py-2 rounded-lg transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload Model
          </button>
        </div>
      </div>

      {/* Stat bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total Models", value:stats.total, color:"text-white" },
          { label:"Deployed", value:stats.deployed, color:"text-green-400" },
          { label:"Training", value:stats.training, color:"text-amber-400" },
          { label:"Ready to Deploy", value:stats.trained, color:"text-blue-400" },
        ].map((s,i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search models..."
            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/50" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-muted/30 border border-border/50 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-violet-400/50">
          {STATUSES.map(s=><option key={s} value={s}>{s==="ALL"?"All Status":s}</option>)}
        </select>
      </div>

      {/* Model cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-48"><div className="h-4 bg-muted/50 rounded mb-3 w-3/4"/><div className="h-3 bg-muted/30 rounded w-1/2"/></div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30"/>
          <p className="text-white font-semibold mb-1">No models found</p>
          <p className="text-sm text-muted-foreground mb-4">Upload your first AI model to get started</p>
          <button onClick={()=>setShowUpload(true)} className="text-sm bg-violet-500 hover:bg-violet-400 text-white font-bold px-4 py-2 rounded-lg transition-all">+ Upload Model</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(model => (
            <div key={model.id} onClick={()=>setSelected(model)} className="glass rounded-2xl p-5 glow-border hover:border-violet-400/40 cursor-pointer transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-400"/>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{model.name}</h3>
                    <span className="text-[10px] text-muted-foreground">v{model.version}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${STATUS_COLORS[model.status]||STATUS_COLORS.DRAFT}`}>{model.status}</span>
              </div>

              {/* Training progress */}
              {model.status === "TRAINING" && model.trainingJobs?.[0] && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3 text-amber-400"/>Training...</span>
                    <span className="text-amber-400 font-mono">{model.trainingJobs[0].progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{width:`${model.trainingJobs[0].progress}%`}}/>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-mono font-bold ${FRAMEWORK_COLORS[model.framework]||"text-cyan-400"}`}>{model.framework}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[model.type]||model.type}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="text-center">
                  <div className="text-white font-bold">{model.accuracy ? `${model.accuracy}%` : "—"}</div>
                  <div className="text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold">{model.latency ? `${model.latency}ms` : "—"}</div>
                  <div className="text-muted-foreground">Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-bold">{fmtSize(model.size||undefined)}</div>
                  <div className="text-muted-foreground">Size</div>
                </div>
              </div>

              {model.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {model.tags.slice(0,3).map((t,i)=>(
                    <span key={i} className="text-[9px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="w-full max-w-md bg-card border-l border-border/50 overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/30 flex items-center justify-between p-5">
              <div>
                <h2 className="text-lg font-black text-white">{selected.name}</h2>
                <span className="text-xs text-muted-foreground">v{selected.version} · {selected.framework}</span>
              </div>
              <button onClick={()=>setSelected(null)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="p-5 space-y-4">
              <span className={`text-xs font-mono px-3 py-1.5 rounded-full ${STATUS_COLORS[selected.status]||STATUS_COLORS.DRAFT}`}>{selected.status}</span>

              {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}

              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:"Type",value:TYPE_LABELS[selected.type]||selected.type},
                  {label:"Framework",value:selected.framework},
                  {label:"Accuracy",value:selected.accuracy ? `${selected.accuracy}%` : "—"},
                  {label:"Latency",value:selected.latency ? `${selected.latency}ms` : "—"},
                  {label:"Model Size",value:fmtSize(selected.size||undefined)},
                  {label:"Deployments",value:String(selected._count?.deployments || 0)},
                ].map((item,i)=>(
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Status actions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">Actions</div>
                {selected.status === "TRAINED" && (
                  <button onClick={()=>handleStatusUpdate(selected.id,"DEPLOYED")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 transition-all text-sm text-green-400">
                    <Play className="w-4 h-4"/> Deploy Model
                  </button>
                )}
                {selected.status === "DEPLOYED" && (
                  <button onClick={()=>handleStatusUpdate(selected.id,"TRAINED")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20 transition-all text-sm text-amber-400">
                    <Archive className="w-4 h-4"/> Undeploy Model
                  </button>
                )}
                {selected.status === "DRAFT" && (
                  <button onClick={()=>handleStatusUpdate(selected.id,"TRAINING")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-400/30 hover:bg-violet-500/20 transition-all text-sm text-violet-400">
                    <Zap className="w-4 h-4"/> Start Training
                  </button>
                )}
                <button onClick={()=>handleDelete(selected.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/30 hover:bg-red-500/20 transition-all text-sm text-red-400">
                  <Trash2 className="w-4 h-4"/> Delete Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowUpload(false)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">Upload / Register Model</h2><p className="text-xs text-muted-foreground mt-1">Add a new model to your AI hub</p></div>
              <button onClick={()=>setShowUpload(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              {[
                {key:"name",label:"Model Name *",placeholder:"e.g. YOLOv8 Edge Detector"},
                {key:"version",label:"Version",placeholder:"1.0.0"},
                {key:"description",label:"Description",placeholder:"Short description of what this model does"},
                {key:"accuracy",label:"Accuracy (%)",placeholder:"e.g. 94.2"},
                {key:"latency",label:"Inference Latency (ms)",placeholder:"e.g. 28"},
                {key:"tags",label:"Tags (comma-separated)",placeholder:"edge, realtime, vision"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/50"/>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Model Type *</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400/50">
                  <option value="">Select type...</option>
                  {MODEL_TYPES.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Framework *</label>
                <select value={form.framework} onChange={e=>setForm(p=>({...p,framework:e.target.value}))}
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white focus:outline-none focus:border-violet-400/50">
                  <option value="">Select framework...</option>
                  {FRAMEWORKS.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <button onClick={handleCreate} disabled={saving}
                className="w-full mt-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : <><Check className="w-4 h-4"/>Create Model</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
