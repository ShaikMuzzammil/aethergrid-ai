"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Download, Plus, X, Check, RefreshCw, FileText, Database, Trash2, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";

const DATA_TYPES = ["devices","models","deployments","automations"] as const;
const FORMATS = ["CSV","JSON","XLSX"] as const;
const FORMAT_ICONS: Record<string,string> = { CSV:"📊", JSON:"📋", XLSX:"📗" };
const TYPE_ICONS: Record<string,string> = { devices:"💻", models:"🧠", deployments:"🚀", automations:"⚡" };
const TYPE_LABELS: Record<string,string> = { devices:"IoT Devices", models:"AI Models", deployments:"Deployments", automations:"Automations" };

interface ExportJob {
  id:string; name:string; format:string; dataType:string; status:string;
  rowCount?:number; fileSize?:number; fileUrl?:string; createdAt:string; completedAt?:string;
}

function fmtSize(b?:number) {
  if (!b) return "—";
  if (b>1e6) return `${(b/1e6).toFixed(1)} MB`;
  if (b>1e3) return `${(b/1e3).toFixed(0)} KB`;
  return `${b} B`;
}

export default function ExportClient() {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", format:"CSV" as typeof FORMATS[number], dataType:"devices" as typeof DATA_TYPES[number] });
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/export");
      const data = await res.json();
      setJobs(data.jobs||[]);
    } catch { toast.error("Failed to load exports"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchJobs();
    // poll for processing jobs
    pollRef.current = setInterval(() => {
      setJobs(prev => {
        if (prev.some(j=>j.status==="PROCESSING")) { fetchJobs(); }
        return prev;
      });
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchJobs]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Export name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/export",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      toast.success("Export job queued — processing...");
      setShowNew(false);
      setForm({ name:"", format:"CSV", dataType:"devices" });
      fetchJobs();
    } catch (e:any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDownload = async (job:ExportJob) => {
    if (job.status!=="COMPLETED") { toast.error("Export not ready yet"); return; }
    try {
      const res = await fetch(`/api/export/${job.id}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url;
      a.download = `${job.name.toLowerCase().replace(/\s+/g,"-")}.${job.format.toLowerCase()}`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch { toast.error("Download failed"); }
  };

  const handleDelete = async (id:string) => {
    try {
      await fetch(`/api/export/${id}`,{method:"DELETE"});
      toast.success("Export deleted");
      fetchJobs();
    } catch { toast.error("Failed to delete"); }
  };

  const statusIcon = (s:string) => {
    if (s==="COMPLETED") return <CheckCircle className="w-4 h-4 text-green-400"/>;
    if (s==="FAILED") return <AlertCircle className="w-4 h-4 text-red-400"/>;
    if (s==="PROCESSING") return <Loader className="w-4 h-4 text-amber-400 animate-spin"/>;
    return <Clock className="w-4 h-4 text-muted-foreground"/>;
  };

  const statusColor = (s:string) => ({
    COMPLETED:"text-green-400 bg-green-400/10", FAILED:"text-red-400 bg-red-400/10",
    PROCESSING:"text-amber-400 bg-amber-400/10", PENDING:"text-slate-400 bg-slate-400/10"
  }[s]||"text-muted-foreground bg-muted/20");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Data Export</h1>
          <p className="text-sm text-muted-foreground mt-1">Export your fleet data to CSV, JSON, or XLSX</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchJobs} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5"/> New Export
          </button>
        </div>
      </div>

      {/* Quick export tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DATA_TYPES.map(type=>(
          <button key={type} onClick={()=>{setForm({name:`${TYPE_LABELS[type]} Export`,format:"CSV",dataType:type});setShowNew(true)}}
            className="glass rounded-xl p-4 glow-border hover:border-cyan-400/40 transition-all text-left group">
            <div className="text-2xl mb-2">{TYPE_ICONS[type]}</div>
            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{TYPE_LABELS[type]}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Quick CSV export</p>
          </button>
        ))}
      </div>

      {/* Jobs */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-cyan-400"/> Export History</h2>
        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-20"/>)}</div>
        ) : jobs.length===0 ? (
          <div className="text-center py-12 glass rounded-2xl">
            <Download className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30"/>
            <p className="text-white font-semibold mb-1">No exports yet</p>
            <p className="text-sm text-muted-foreground">Create your first export to download your fleet data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job=>(
              <div key={job.id} className="glass rounded-2xl p-4 glow-border flex items-center gap-4 flex-wrap">
                <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center text-lg shrink-0">
                  {FORMAT_ICONS[job.format]||"📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{job.name}</p>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColor(job.status)}`}>
                      {statusIcon(job.status)} {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                    <span>{TYPE_ICONS[job.dataType]} {TYPE_LABELS[job.dataType]}</span>
                    <span>·</span>
                    <span>{job.format}</span>
                    {job.rowCount && <span>· {job.rowCount.toLocaleString()} rows</span>}
                    {job.fileSize && <span>· {fmtSize(job.fileSize)}</span>}
                    <span>· <Clock className="w-3 h-3 inline mr-0.5"/>{new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.status==="COMPLETED" && (
                    <button onClick={()=>handleDownload(job)} className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400 border border-cyan-400/30 hover:border-cyan-400/60 bg-cyan-400/5 hover:bg-cyan-400/10 px-3 py-1.5 rounded-lg transition-all">
                      <Download className="w-3 h-3"/> Download
                    </button>
                  )}
                  <button onClick={()=>handleDelete(job.id)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Export Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowNew(false)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">New Export</h2><p className="text-xs text-muted-foreground mt-1">Choose data type and format</p></div>
              <button onClick={()=>setShowNew(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Export Name *</label>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Device Fleet Export"
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Data Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DATA_TYPES.map(t=>(
                    <button key={t} onClick={()=>setForm(p=>({...p,dataType:t}))}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.dataType===t?"border-cyan-400 bg-cyan-400/10":"border-border/30 hover:border-cyan-400/30"}`}>
                      <span className="text-base">{TYPE_ICONS[t]}</span>
                      <span className={`text-xs font-semibold ${form.dataType===t?"text-white":"text-muted-foreground"}`}>{TYPE_LABELS[t]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map(f=>(
                    <button key={f} onClick={()=>setForm(p=>({...p,format:f}))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${form.format===f?"border-cyan-400 bg-cyan-400/10":"border-border/30 hover:border-cyan-400/30"}`}>
                      <span className="text-base">{FORMAT_ICONS[f]}</span>
                      <span className={`text-xs font-bold ${form.format===f?"text-white":"text-muted-foreground"}`}>{f}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreate} disabled={saving}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Queuing...</>:<><Download className="w-4 h-4"/>Start Export</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
