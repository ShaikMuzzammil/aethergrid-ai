"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Brain, Plus, Search, Upload, Play, Pause, RefreshCw, X, Check,
  Cpu, Zap, Activity, TrendingUp, Download, Copy, ChevronRight,
  Eye, Trash2, Settings, AlertTriangle, Clock, Award, BarChart2,
  Layers, Code, FlaskConical, Rocket
} from "lucide-react";
import { cn, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

const FRAMEWORKS = ["TENSORFLOW", "PYTORCH", "ONNX", "TFLITE", "OPENVINO", "CUSTOM"];
const MODEL_TYPES = ["OBJECT_DETECTION", "IMAGE_SEGMENTATION", "CLASSIFICATION", "ANOMALY_DETECTION", "NLP", "TIME_SERIES", "RECOMMENDATION", "GENERATIVE"];

const MOCK_MODELS = [
  { id: "m1", name: "YOLOv8 Edge Detector", version: "2.1.0", type: "OBJECT_DETECTION", framework: "TFLITE", status: "DEPLOYED", accuracy: 94.2, size: 6.4, latency: 28, devices: 128, requests: 1842000, tags: ["production", "vision"], createdAt: new Date(Date.now() - 30 * 86400000) },
  { id: "m2", name: "Anomaly Sentinel", version: "1.3.2", type: "ANOMALY_DETECTION", framework: "ONNX", status: "DEPLOYED", accuracy: 91.8, size: 12.1, latency: 12, devices: 64, requests: 4520000, tags: ["monitoring"], createdAt: new Date(Date.now() - 45 * 86400000) },
  { id: "m3", name: "NLP Intent Classifier", version: "3.0.0", type: "NLP", framework: "PYTORCH", status: "DEPLOYED", accuracy: 88.5, size: 45.2, latency: 45, devices: 32, requests: 890000, tags: ["nlp", "beta"], createdAt: new Date(Date.now() - 15 * 86400000) },
  { id: "m4", name: "TS Forecaster Pro", version: "1.0.1", type: "TIME_SERIES", framework: "TENSORFLOW", status: "TRAINING", accuracy: 86.3, size: 8.8, latency: 65, devices: 0, requests: 0, tags: ["forecasting"], createdAt: new Date(Date.now() - 3 * 86400000) },
  { id: "m5", name: "MobileNet Classifier", version: "4.0.0", type: "CLASSIFICATION", framework: "TFLITE", status: "TRAINED", accuracy: 92.1, size: 3.2, latency: 8, devices: 0, requests: 0, tags: ["mobile", "edge"], createdAt: new Date(Date.now() - 7 * 86400000) },
  { id: "m6", name: "Recommendation Engine", version: "2.0.0", type: "RECOMMENDATION", framework: "ONNX", status: "DRAFT", accuracy: null, size: 22.5, latency: null, devices: 0, requests: 0, tags: ["reco"], createdAt: new Date(Date.now() - 1 * 86400000) },
];

const TRAINING_HISTORY = Array.from({ length: 20 }, (_, i) => ({
  epoch: i + 1,
  loss: Math.max(0.05, 0.9 - i * 0.04 + Math.random() * 0.05),
  val_loss: Math.max(0.08, 0.95 - i * 0.04 + Math.random() * 0.07),
  accuracy: Math.min(98, 50 + i * 2.2 + Math.random() * 3),
}));

const TYPE_ICONS: Record<string, string> = {
  OBJECT_DETECTION: "👁️", IMAGE_SEGMENTATION: "🎭", CLASSIFICATION: "🏷️",
  ANOMALY_DETECTION: "🔍", NLP: "💬", TIME_SERIES: "📈",
  RECOMMENDATION: "⭐", GENERATIVE: "✨",
};

const FRAMEWORK_COLORS: Record<string, string> = {
  TENSORFLOW: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  PYTORCH: "text-red-400 bg-red-400/10 border-red-400/20",
  ONNX: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  TFLITE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  OPENVINO: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  CUSTOM: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function UploadModelModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", type: "CLASSIFICATION", framework: "TFLITE", description: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setFileName(file.name); simulateUpload(); }
  }

  async function simulateUpload() {
    setUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 120));
      setUploadProgress(i);
    }
    setUploading(false);
  }

  async function handleCreate() {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`Model "${form.name}" created successfully!`);
    setUploading(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-xl glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div><h2 className="font-bold text-foreground">Upload AI Model</h2>
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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Model Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. YOLOv8 Edge Detector v3"
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Model Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {MODEL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Framework</label>
                  <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {FRAMEWORKS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your model's purpose and capabilities..."
                  rows={3}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm font-medium text-foreground mb-2">Upload Model File</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn("border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer", dragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40")}>
                {fileName ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center"><Check className="w-5 h-5 text-green-400" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{fileName}</p>
                      <p className="text-xs text-green-400">Upload complete</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">Drop your model file here</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports .tflite, .onnx, .pt, .h5, .pb (max 2GB)</p>
                    <label className="mt-4 inline-block cursor-pointer px-4 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
                      Browse Files <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFileName(e.target.files[0].name); simulateUpload(); } }} />
                    </label>
                  </>
                )}
              </div>
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Uploading...</span><span className="text-primary">{uploadProgress}%</span></div>
                  <div className="h-2 bg-muted rounded-full"><div className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
                </div>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm font-medium text-foreground mb-3">Configuration</p>
              <div className="space-y-3">
                {[
                  { label: "Optimization", options: ["None", "Quantization (INT8)", "Quantization (FP16)", "Pruning", "Knowledge Distillation"], desc: "Reduce model size for edge deployment" },
                  { label: "Target Hardware", options: ["CPU (Generic)", "GPU", "NPU", "DSP", "FPGA", "TPU"], desc: "Optimize for specific processor" },
                  { label: "Batch Size", options: ["1", "4", "8", "16", "32"], desc: "Inference batch size" },
                ].map(cfg => (
                  <div key={cfg.label} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div><p className="text-sm font-medium text-foreground">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">{cfg.desc}</p></div>
                    </div>
                    <select className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                      {cfg.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {step > 1 ? "Back" : "Cancel"}
          </button>
          <button onClick={() => step < 3 ? setStep(s => s + 1) : handleCreate()}
            disabled={uploading || (step === 1 && !form.name)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {uploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {step < 3 ? "Next" : uploading ? "Creating..." : "Create Model"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModelDetailPanel({ model, onClose }: { model: typeof MOCK_MODELS[0]; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "training" | "inference" | "deploy">("overview");
  const [inferenceInput, setInferenceInput] = useState('{"image": "base64_encoded_image_data"}');
  const [inferenceOutput, setInferenceOutput] = useState("");
  const [inferring, setInferring] = useState(false);

  async function runInference() {
    setInferring(true);
    await new Promise(r => setTimeout(r, 1500));
    setInferenceOutput(JSON.stringify({
      predictions: [{ label: "object_1", confidence: 0.94, bbox: [120, 45, 380, 290] }, { label: "object_2", confidence: 0.87, bbox: [400, 100, 600, 350] }],
      latency_ms: 28.4, model_version: model.version, timestamp: new Date().toISOString()
    }, null, 2));
    setInferring(false);
  }

  const tabs = [{ id: "overview", label: "Overview", icon: <Eye className="w-3.5 h-3.5" /> }, { id: "training", label: "Training", icon: <Activity className="w-3.5 h-3.5" /> }, { id: "inference", label: "Playground", icon: <FlaskConical className="w-3.5 h-3.5" /> }, { id: "deploy", label: "Deploy", icon: <Rocket className="w-3.5 h-3.5" /> }];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-xl h-full overflow-y-auto glass border border-border/60 rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-2xl">{TYPE_ICONS[model.type]}</div>
              <div>
                <h2 className="font-bold text-foreground text-sm">{model.name}</h2>
                <p className="text-xs text-muted-foreground">v{model.version} · {model.type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getStatusColor(model.status), "border-current/20")}>{model.status}</span>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", activeTab === tab.id ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Accuracy", value: model.accuracy ? `${model.accuracy}%` : "—", color: "text-green-400" },
                  { label: "Avg Latency", value: model.latency ? `${model.latency}ms` : "—", color: "text-cyan-400" },
                  { label: "Model Size", value: `${model.size} MB`, color: "text-violet-400" },
                  { label: "Deployments", value: model.devices, color: "text-blue-400" },
                  { label: "Total Requests", value: model.requests > 1000 ? `${(model.requests / 1000000).toFixed(1)}M` : model.requests, color: "text-yellow-400" },
                  { label: "Framework", value: model.framework, color: "text-orange-400" },
                ].map((m, i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className={cn("text-base font-bold mt-0.5", m.color)}>{m.value}</p>
                  </div>
                ))}
              </div>
              {model.accuracy && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Accuracy Score</p>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full" style={{ width: `${model.accuracy}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0%</span><span className="text-green-400 font-medium">{model.accuracy}%</span><span>100%</span></div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">{model.tags.map(tag => (<span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground">#{tag}</span>))}</div>
              </div>
            </div>
          )}
          {activeTab === "training" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Training Progress</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={TRAINING_HISTORY}>
                  <defs>
                    <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="loss" name="Loss" stroke="#EF4444" fill="url(#lossGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="val_loss" name="Val Loss" stroke="#F59E0B" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={TRAINING_HISTORY}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} domain={[50, 100]} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" fill="url(#accGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {activeTab === "inference" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Live Inference Playground</p>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Input Payload (JSON)</label>
                <textarea value={inferenceInput} onChange={e => setInferenceInput(e.target.value)} rows={5}
                  className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
              <button onClick={runInference} disabled={inferring || model.status !== "DEPLOYED"}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all">
                {inferring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {inferring ? "Running inference..." : model.status !== "DEPLOYED" ? "Model not deployed" : "Run Inference"}
              </button>
              {inferenceOutput && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-muted-foreground">Output</label>
                    <button onClick={() => { navigator.clipboard.writeText(inferenceOutput); toast.success("Copied!"); }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"><Copy className="w-3 h-3" />Copy</button>
                  </div>
                  <pre className="bg-muted/20 rounded-xl p-3 text-xs font-mono text-green-400 overflow-auto max-h-48">{inferenceOutput}</pre>
                </div>
              )}
            </div>
          )}
          {activeTab === "deploy" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">Deploy to Devices</p>
              {["Deploy to all {model.devices > 0 ? model.devices : 0} connected devices", "Target specific device group", "Schedule rolling deployment", "A/B test with previous version"].map((opt, i) => (
                <div key={i} className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 cursor-pointer transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">{i + 1}</div>
                  <p className="text-sm text-muted-foreground">{opt.replace("{model.devices > 0 ? model.devices : 0}", String(model.devices))}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              ))}
              <button onClick={() => toast.success("Deployment initiated!")}
                disabled={model.status === "DRAFT" || model.status === "TRAINING"}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <Rocket className="w-4 h-4" /> Deploy Now
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AiModelsClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedModel, setSelectedModel] = useState<typeof MOCK_MODELS[0] | null>(null);

  const filtered = MOCK_MODELS.filter(m => {
    const ms = search.toLowerCase();
    return (m.name.toLowerCase().includes(ms) || m.framework.toLowerCase().includes(ms)) &&
      (statusFilter === "ALL" || m.status === statusFilter) &&
      (typeFilter === "ALL" || m.type === typeFilter);
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>{showUpload && <UploadModelModal onClose={() => setShowUpload(false)} />}</AnimatePresence>
      <AnimatePresence>{selectedModel && <ModelDetailPanel model={selectedModel} onClose={() => setSelectedModel(null)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">AI Model Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MOCK_MODELS.length} models · {MOCK_MODELS.filter(m => m.status === "DEPLOYED").length} deployed</p></div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> Upload Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Models", value: MOCK_MODELS.length, icon: <Brain className="w-4 h-4" />, color: "violet" },
          { label: "Deployed", value: MOCK_MODELS.filter(m => m.status === "DEPLOYED").length, icon: <Rocket className="w-4 h-4" />, color: "green" },
          { label: "Training", value: MOCK_MODELS.filter(m => m.status === "TRAINING").length, icon: <Activity className="w-4 h-4" />, color: "blue" },
          { label: "Total Inferences", value: "7.3M", icon: <Zap className="w-4 h-4" />, color: "yellow" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border">
            <div className={cn("flex items-center gap-2 mb-1", `text-${s.color}-400`)}>{s.icon}<span className="text-2xl font-bold">{s.value}</span></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
          <option value="ALL">All Status</option>
          {["DRAFT", "TRAINING", "TRAINED", "DEPLOYED", "ARCHIVED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
          <option value="ALL">All Types</option>
          {MODEL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((model, i) => (
          <motion.div key={model.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5 glow-border hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedModel(model)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">{TYPE_ICONS[model.type]}</div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{model.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">v{model.version}</p>
                </div>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getStatusColor(model.status), "border-current/20")}>{model.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center"><p className="text-xs text-muted-foreground">Accuracy</p><p className="text-sm font-bold text-green-400">{model.accuracy ? `${model.accuracy}%` : "—"}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Latency</p><p className="text-sm font-bold text-cyan-400">{model.latency ? `${model.latency}ms` : "—"}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Size</p><p className="text-sm font-bold text-violet-400">{model.size}MB</p></div>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn("text-xs px-2 py-0.5 rounded-md border", FRAMEWORK_COLORS[model.framework])}>{model.framework}</span>
              <span className="text-xs text-muted-foreground">{model.devices} devices</span>
            </div>
            {model.status === "TRAINING" && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Training...</span><span className="text-blue-400">Epoch 14/20</span></div>
                <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: "70%" }} /></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
