"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Plus, Search, RefreshCw, CheckCircle, XCircle,
  FileText, Database, Code, Globe, File, Archive, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FORMAT_CATEGORIES = [
  {
    name: "Tabular", icon: <FileText className="w-4 h-4" />, color: "cyan",
    formats: ["CSV", "Excel (.xlsx)", "ODS", "TSV", "Parquet", "ORC", "Avro"],
  },
  {
    name: "JSON-Based", icon: <Code className="w-4 h-4" />, color: "yellow",
    formats: ["JSON", "JSONL", "NDJSON", "GeoJSON"],
  },
  {
    name: "Database", icon: <Database className="w-4 h-4" />, color: "violet",
    formats: ["SQLite", "PostgreSQL Dump", "MySQL Dump", "MongoDB BSON"],
  },
  {
    name: "Document", icon: <File className="w-4 h-4" />, color: "green",
    formats: ["PDF Report", "HTML", "Markdown", "LaTeX", "RTF", "DOCX"],
  },
  {
    name: "Serialization", icon: <Archive className="w-4 h-4" />, color: "orange",
    formats: ["Protocol Buffers", "MessagePack", "CBOR", "YAML", "TOML"],
  },
  {
    name: "Geospatial", icon: <Globe className="w-4 h-4" />, color: "blue",
    formats: ["Shapefile", "KML", "GPX", "WKT", "WKB"],
  },
];

const DATA_SOURCES = ["Device Telemetry", "Sensor Readings", "AI Model Metrics", "Inference Logs", "Audit Logs", "Deployment Metrics", "Alert History", "API Usage"];

const MOCK_EXPORTS = [
  { id: "e1", name: "telemetry_jan_2025", format: "CSV", status: "COMPLETED", size: "2.4 GB", rows: 4820000, created: "2h ago" },
  { id: "e2", name: "model_metrics_q4", format: "Excel (.xlsx)", status: "COMPLETED", size: "18.2 MB", rows: 24500, created: "1d ago" },
  { id: "e3", name: "device_audit_export", format: "JSON", status: "PROCESSING", size: "—", rows: null, created: "5m ago" },
  { id: "e4", name: "inference_logs_jan", format: "Parquet", status: "COMPLETED", size: "890 MB", rows: 1200000, created: "3d ago" },
  { id: "e5", name: "geo_device_locations", format: "GeoJSON", status: "FAILED", size: "—", rows: null, created: "6h ago" },
];

function NewExportModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [source, setSource] = useState(DATA_SOURCES[0]);
  const [dateRange, setDateRange] = useState("last_7_days");
  const [_exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"config" | "running">("config");

  async function startExport() {
    if (!selected) return;
    setStep("running"); setExporting(true);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }
    toast.success(`Export to ${selected} completed!`);
    setExporting(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-2xl glass rounded-2xl border border-border/60 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-md z-10">
          <h2 className="font-bold text-foreground">New Export</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">
          {step === "config" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data Source</label>
                  <select value={source} onChange={e => setSource(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {DATA_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date Range</label>
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {["last_1_hour", "last_24_hours", "last_7_days", "last_30_days", "last_90_days", "custom"].map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Select Export Format</p>
                <div className="space-y-4">
                  {FORMAT_CATEGORIES.map(cat => (
                    <div key={cat.name}>
                      <div className={cn("flex items-center gap-2 text-xs font-semibold mb-2 uppercase tracking-wider", `text-${cat.color}-400`)}>
                        {cat.icon} {cat.name}
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {cat.formats.map(fmt => (
                          <button key={fmt} onClick={() => setSelected(fmt)}
                            className={cn("px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left", selected === fmt ? `border-${cat.color}-400/60 bg-${cat.color}-400/10 text-${cat.color}-400` : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground")}>
                            {selected === fmt && <span className="mr-1">✓</span>}{fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selected && (
                <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
                  <p className="text-xs text-muted-foreground mb-1">Selected format</p>
                  <p className="text-sm font-bold text-primary">{selected}</p>
                  <p className="text-xs text-muted-foreground mt-1">Estimated size: ~2.1 GB · ~4.2M rows</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                {progress < 100 ? <RefreshCw className="w-8 h-8 text-primary animate-spin" /> : <CheckCircle className="w-8 h-8 text-green-400" />}
              </div>
              <div>
                <p className="font-bold text-foreground">{progress < 100 ? `Exporting to ${selected}...` : "Export Complete!"}</p>
                <p className="text-sm text-muted-foreground mt-1">{progress < 100 ? "Processing your data..." : "Your file is ready to download."}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2 px-8">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full mx-8 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>~4.2M rows processed</span><span>·</span><span>~2.1 GB</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50 sticky bottom-0 bg-card/80 backdrop-blur-md">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          {step === "config" && (
            <button onClick={startExport} disabled={!selected}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
              <Download className="w-4 h-4" /> Start Export
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExportClient() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const filtered = MOCK_EXPORTS.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.format.toLowerCase().includes(search.toLowerCase()));

  function statusIcon(status: string) {
    if (status === "COMPLETED") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "PROCESSING") return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{showNew && <NewExportModal onClose={() => setShowNew(false)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Export Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">30+ formats · Scheduled reports · API streaming</p></div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> New Export
        </button>
      </div>

      {/* Format overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FORMAT_CATEGORIES.map(cat => (
          <div key={cat.name} className={cn("glass rounded-xl p-4 glow-border text-center cursor-pointer hover:-translate-y-0.5 transition-all")}
            onClick={() => setShowNew(true)}>
            <div className={cn("w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-2", `bg-${cat.color}-400/15 text-${cat.color}-400`)}>
              {cat.icon}
            </div>
            <p className="text-xs font-medium text-foreground">{cat.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{cat.formats.length} formats</p>
          </div>
        ))}
      </div>

      {/* Recent exports */}
      <div className="glass rounded-2xl glow-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Recent Exports</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="bg-muted/30 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/30">
            {["Export Name", "Format", "Status", "Size", "Rows", "Created", "Actions"].map(h => (
              <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
            ))}</tr></thead>
          <tbody>
            {filtered.map((exp, i) => (
              <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="data-table-row">
                <td className="px-5 py-3 font-medium text-foreground">{exp.name}</td>
                <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">{exp.format}</span></td>
                <td className="px-5 py-3"><div className="flex items-center gap-1.5">{statusIcon(exp.status)}<span className="text-xs text-muted-foreground">{exp.status}</span></div></td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{exp.size}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{exp.rows ? exp.rows.toLocaleString() : "—"}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{exp.created}</td>
                <td className="px-5 py-3">
                  {exp.status === "COMPLETED" && (
                    <button onClick={() => toast.success("Download started!")}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
