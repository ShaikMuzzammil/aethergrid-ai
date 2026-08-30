"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Cpu, Plus, Search, Filter, Wifi, WifiOff, AlertTriangle,
  Wrench, X, ChevronRight, RefreshCw, MapPin, Activity,
  Thermometer, MemoryStick, Zap, Trash2, Terminal, Upload, RotateCcw, Check
} from "lucide-react";

const DEVICE_TYPES = ["ESP32","ESP8266","RASPBERRY_PI","NVIDIA_JETSON","STM32","RISCV","ARDUINO","CUSTOM"] as const;
const STATUSES = ["ALL","ONLINE","OFFLINE","WARNING","ERROR","MAINTENANCE"] as const;

const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string }> = {
  ONLINE: { color: "text-green-400", icon: <Wifi className="w-3 h-3" />, bg: "bg-green-400/10" },
  OFFLINE: { color: "text-slate-400", icon: <WifiOff className="w-3 h-3" />, bg: "bg-slate-400/10" },
  WARNING: { color: "text-amber-400", icon: <AlertTriangle className="w-3 h-3" />, bg: "bg-amber-400/10" },
  ERROR: { color: "text-red-400", icon: <AlertTriangle className="w-3 h-3" />, bg: "bg-red-400/10" },
  MAINTENANCE: { color: "text-blue-400", icon: <Wrench className="w-3 h-3" />, bg: "bg-blue-400/10" },
};

const TYPE_LABELS: Record<string, string> = {
  ESP32: "ESP32", ESP8266: "ESP8266", RASPBERRY_PI: "Raspberry Pi",
  NVIDIA_JETSON: "NVIDIA Jetson", STM32: "STM32", RISCV: "RISC-V",
  ARDUINO: "Arduino", CUSTOM: "Custom",
};

interface Device {
  id: string; name: string; type: string; status: string;
  firmwareVersion?: string; ipAddress?: string; location?: string;
  cpu?: number; memory?: number; temperature?: number;
  lastSeen?: string; tags: string[];
  alerts?: Array<{ severity: string; message: string }>;
}

export default function DevicesClient() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addType, setAddType] = useState("");
  const [form, setForm] = useState({ name: "", firmwareVersion: "", ipAddress: "", macAddress: "", location: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      const res = await fetch(`/api/devices?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDevices(data.devices || []);
      setTotal(data.total || 0);
    } catch { toast.error("Failed to load devices"); }
    finally { setLoading(false); }
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const filtered = devices.filter(d =>
    search === "" ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!addType) { toast.error("Select a device type"); return; }
    if (!form.name.trim()) { toast.error("Device name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, type: addType,
          firmwareVersion: form.firmwareVersion || undefined,
          ipAddress: form.ipAddress || undefined,
          macAddress: form.macAddress || undefined,
          location: form.location || undefined,
          tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast.success("Device registered successfully!");
      setShowAdd(false); setAddStep(1); setAddType(""); setForm({ name: "", firmwareVersion: "", ipAddress: "", macAddress: "", location: "", tags: "" });
      fetchDevices();
    } catch (e: any) { toast.error(e.message || "Failed to add device"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Device removed");
      setSelectedDevice(null); setConfirmDelete(null);
      fetchDevices();
    } catch { toast.error("Failed to delete device"); }
  };

  const handleCommand = async (deviceId: string, command: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, payload: {} }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Command '${command}' sent`);
    } catch { toast.error("Failed to send command"); }
  };

  const statusCounts = STATUSES.slice(1).reduce((acc, s) => ({ ...acc, [s]: devices.filter(d => d.status === s).length }), {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">IoT Devices</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total · {statusCounts.ONLINE || 0} online · {statusCounts.WARNING || 0} warnings · {statusCounts.ERROR || 0} errors</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDevices} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => { setShowAdd(true); setAddStep(1); }}
            className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Device
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices..."
            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/50 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-muted/30 border border-border/50 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-cyan-400/50">
          {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-muted/30 border border-border/50 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-cyan-400/50">
          <option value="ALL">All Types</option>
          {DEVICE_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Device grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse"><div className="h-4 bg-muted/50 rounded mb-3 w-3/4" /><div className="h-3 bg-muted/30 rounded w-1/2" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Cpu className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-white font-semibold mb-1">No devices found</p>
          <p className="text-sm text-muted-foreground mb-4">{search ? "Try a different search term" : "Register your first IoT device to get started"}</p>
          {!search && <button onClick={() => setShowAdd(true)} className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">+ Add First Device</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(device => {
            const sc = STATUS_CONFIG[device.status] || STATUS_CONFIG.OFFLINE;
            const alertCount = device.alerts?.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").length || 0;
            return (
              <div key={device.id} onClick={() => setSelectedDevice(device)} className="glass rounded-2xl p-5 glow-border hover:border-cyan-400/40 cursor-pointer transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground">{TYPE_LABELS[device.type]}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{device.name}</h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono ${sc.color} ${sc.bg}`}>
                    {sc.icon} {device.status}
                  </div>
                </div>
                {device.location && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" /> {device.location}
                  </div>
                )}
                {device.status === "ONLINE" && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" />CPU</div>
                      <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${device.cpu || 0}%` }} /></div>
                      <span className="text-[9px] font-mono text-cyan-400">{device.cpu || 0}%</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><MemoryStick className="w-3 h-3" />MEM</div>
                      <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-violet-400 rounded-full" style={{ width: `${device.memory || 0}%` }} /></div>
                      <span className="text-[9px] font-mono text-violet-400">{device.memory || 0}%</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">
                    {device.lastSeen ? `Last seen ${new Date(device.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Never seen"}
                  </span>
                  {alertCount > 0 && (
                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-mono">{alertCount} alert{alertCount > 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDevice(null)} />
          <div className="w-full max-w-md bg-card border-l border-border/50 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-card border-b border-border/30 flex items-center justify-between p-5">
              <div>
                <h2 className="text-lg font-black text-white">{selectedDevice.name}</h2>
                <span className="text-xs text-muted-foreground">{TYPE_LABELS[selectedDevice.type]}</span>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-muted/30 rounded-lg transition-all"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${STATUS_CONFIG[selectedDevice.status]?.bg || "bg-muted/20"}`}>
                {STATUS_CONFIG[selectedDevice.status]?.icon}
                <span className={`text-sm font-bold ${STATUS_CONFIG[selectedDevice.status]?.color || "text-white"}`}>{selectedDevice.status}</span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "IP Address", value: selectedDevice.ipAddress || "—" },
                  { label: "Firmware", value: selectedDevice.firmwareVersion || "—" },
                  { label: "Location", value: selectedDevice.location || "—" },
                  { label: "Last Seen", value: selectedDevice.lastSeen ? new Date(selectedDevice.lastSeen).toLocaleString() : "Never" },
                ].map((item, i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Resource gauges */}
              {selectedDevice.status === "ONLINE" && (
                <div className="glass rounded-xl p-4">
                  <div className="text-xs font-semibold text-white mb-3">Resources</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1"><span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3" />CPU</span><span className="font-mono text-cyan-400">{selectedDevice.cpu || 0}%</span></div>
                      <div className="h-2 bg-muted rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedDevice.cpu || 0}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1"><span className="text-muted-foreground flex items-center gap-1"><MemoryStick className="w-3 h-3" />Memory</span><span className="font-mono text-violet-400">{selectedDevice.memory || 0}%</span></div>
                      <div className="h-2 bg-muted rounded-full"><div className="h-full bg-violet-400 rounded-full" style={{ width: `${selectedDevice.memory || 0}%` }} /></div>
                    </div>
                    {selectedDevice.temperature !== null && selectedDevice.temperature !== undefined && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground flex items-center gap-1"><Thermometer className="w-3 h-3" />Temperature</span>
                        <span className="font-mono text-amber-400">{selectedDevice.temperature}°C</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {(selectedDevice.alerts?.length || 0) > 0 && (
                <div className="glass rounded-xl p-4">
                  <div className="text-xs font-semibold text-white mb-3">Active Alerts</div>
                  {selectedDevice.alerts?.map((alert, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-border/20 last:border-0">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.severity === "CRITICAL" ? "text-red-400" : "text-amber-400"}`} />
                      <p className="text-[11px] text-slate-300">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {selectedDevice.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDevice.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full border border-border/30">{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white mb-2">Device Actions</div>
                <button onClick={() => handleCommand(selectedDevice.id, "ping")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 hover:bg-cyan-500/10 border border-border/30 hover:border-cyan-400/30 transition-all text-sm text-slate-300 hover:text-white">
                  <Terminal className="w-4 h-4 text-cyan-400" /> Remote Shell / Ping
                </button>
                <button onClick={() => handleCommand(selectedDevice.id, "update_firmware")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 hover:bg-violet-500/10 border border-border/30 hover:border-violet-400/30 transition-all text-sm text-slate-300 hover:text-white">
                  <Upload className="w-4 h-4 text-violet-400" /> Update Firmware
                </button>
                <button onClick={() => handleCommand(selectedDevice.id, "reboot")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 hover:bg-amber-500/10 border border-border/30 hover:border-amber-400/30 transition-all text-sm text-slate-300 hover:text-white">
                  <RotateCcw className="w-4 h-4 text-amber-400" /> Reboot Device
                </button>
                {confirmDelete === selectedDevice.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(selectedDevice.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all">
                      <Check className="w-4 h-4" /> Confirm Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-3 rounded-xl bg-muted/30 text-muted-foreground text-sm transition-all">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(selectedDevice.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 hover:bg-red-500/10 border border-border/30 hover:border-red-400/30 transition-all text-sm text-slate-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4 text-red-400" /> Deregister Device
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white">Add Device</h2>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2].map(step => (
                    <div key={step} className={`h-1.5 w-12 rounded-full transition-all ${addStep >= step ? "bg-cyan-400" : "bg-muted"}`} />
                  ))}
                  <span className="text-xs text-muted-foreground">Step {addStep} of 2</span>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            {addStep === 1 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">Select your device hardware type</p>
                <div className="grid grid-cols-4 gap-2">
                  {DEVICE_TYPES.map(type => (
                    <button key={type} onClick={() => setAddType(type)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${addType === type ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-border/30 hover:border-cyan-400/30 text-muted-foreground hover:text-white"}`}>
                      <Cpu className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold">{TYPE_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (!addType) { toast.error("Select a device type"); return; } setAddStep(2); }}
                  className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure your <strong className="text-white">{TYPE_LABELS[addType]}</strong> device</p>
                {[
                  { key: "name", label: "Device Name *", placeholder: "e.g. ESP32-Warehouse-01" },
                  { key: "firmwareVersion", label: "Firmware Version", placeholder: "e.g. 3.1.2" },
                  { key: "ipAddress", label: "IP Address", placeholder: "e.g. 192.168.1.100" },
                  { key: "macAddress", label: "MAC Address", placeholder: "e.g. AA:BB:CC:DD:EE:FF" },
                  { key: "location", label: "Location", placeholder: "e.g. Warehouse A, Bay 1" },
                  { key: "tags", label: "Tags (comma-separated)", placeholder: "e.g. warehouse, sensor, production" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50" />
                  </div>
                ))}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setAddStep(1)} className="flex-1 py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-white transition-all">← Back</button>
                  <button onClick={handleAdd} disabled={saving}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    {saving ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Registering...</> : <><Check className="w-4 h-4" /> Register Device</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
