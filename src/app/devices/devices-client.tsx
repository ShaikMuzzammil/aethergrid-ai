"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Plus, Search, Filter, RefreshCw, Grid3X3, List,
  Wifi, WifiOff, AlertTriangle, Terminal,
  Upload, MapPin, Clock, X, Check,
  Trash2, Power, Eye, Settings
} from "lucide-react";
import { cn, formatTimeAgo, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

const DEVICE_TYPES = ["ESP32", "ESP8266", "RASPBERRY_PI", "NVIDIA_JETSON", "STM32", "RISCV", "ARDUINO", "CUSTOM"];
const DEVICE_STATUSES = ["ONLINE", "OFFLINE", "WARNING", "ERROR", "MAINTENANCE"];

const MOCK_DEVICES = Array.from({ length: 28 }, (_, i) => ({
  id: `dev_${i + 1}`,
  name: [
    "ESP32-Warehouse-A", "Jetson-CV-Edge", "RPi4-Gateway", "STM32-TempSens",
    "Arduino-Actuator", "ESP8266-WiFiNode", "RISCV-Compute", "ESP32-BLE-Hub"
  ][i % 8] + `-${String(i + 1).padStart(2, "0")}`,
  type: DEVICE_TYPES[i % DEVICE_TYPES.length],
  status: DEVICE_STATUSES[i % 5 === 0 ? 1 : i % 7 === 0 ? 2 : i % 11 === 0 ? 3 : 0],
  firmwareVersion: `${2 + (i % 3)}.${i % 9}.${i % 5}`,
  ipAddress: `192.168.${10 + Math.floor(i / 8)}.${20 + (i % 8)}`,
  location: ["Warehouse A", "Production Line 3", "Server Room", "Cold Storage", "Assembly Line", "Roof Array", "Lab 2", "Field Station"][i % 8],
  lastSeen: new Date(Date.now() - Math.random() * 3600000 * 24),
  cpuUsage: Math.floor(10 + Math.random() * 80),
  memUsage: Math.floor(20 + Math.random() * 70),
  temperature: Math.floor(35 + Math.random() * 30),
  uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
  alerts: Math.floor(Math.random() * 5),
  latitude: 12.9716 + (Math.random() - 0.5) * 0.5,
  longitude: 77.5946 + (Math.random() - 0.5) * 0.5,
}));

const TYPE_ICONS: Record<string, string> = {
  ESP32: "🔌", ESP8266: "📡", RASPBERRY_PI: "🍓", NVIDIA_JETSON: "⚡",
  STM32: "🔧", RISCV: "🖥️", ARDUINO: "🔴", CUSTOM: "⚙️",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium", getStatusColor(status),
      "border-current/20")}>
      <span className={cn("w-1.5 h-1.5 rounded-full bg-current",
        status === "ONLINE" && "animate-pulse")} />
      {status}
    </span>
  );
}

function DeviceCard({ device, onSelect }: { device: typeof MOCK_DEVICES[0]; onSelect: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-5 glow-border hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
      onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl">
            {TYPE_ICONS[device.type] || "⚙️"}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{device.name}</p>
            <p className="text-xs text-muted-foreground">{device.type.replace(/_/g, " ")}</p>
          </div>
        </div>
        <StatusBadge status={device.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">CPU</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full">
              <div className={cn("h-full rounded-full transition-all",
                device.cpuUsage > 80 ? "bg-red-400" : device.cpuUsage > 60 ? "bg-yellow-400" : "bg-cyan-400"
              )} style={{ width: `${device.cpuUsage}%` }} />
            </div>
            <span className="text-xs text-foreground font-medium">{device.cpuUsage}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Memory</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full">
              <div className="h-full bg-violet-400 rounded-full" style={{ width: `${device.memUsage}%` }} />
            </div>
            <span className="text-xs text-foreground font-medium">{device.memUsage}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{device.location}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTimeAgo(device.lastSeen)}</span>
      </div>
      {device.alerts > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          {device.alerts} active alert{device.alerts > 1 ? "s" : ""}
        </div>
      )}
    </motion.div>
  );
}

function DeviceRow({ device, onSelect }: { device: typeof MOCK_DEVICES[0]; onSelect: () => void }) {
  return (
    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="data-table-row cursor-pointer" onClick={onSelect}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{TYPE_ICONS[device.type] || "⚙️"}</span>
          <div>
            <p className="font-medium text-foreground text-sm">{device.name}</p>
            <p className="text-xs text-muted-foreground">{device.ipAddress}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><StatusBadge status={device.status} /></td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{device.type.replace(/_/g, " ")}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{device.location}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{device.firmwareVersion}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{formatTimeAgo(device.lastSeen)}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", type: "ESP32", location: "", firmwareVersion: "" });
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success(`Device "${form.name}" registered successfully!`);
    setLoading(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="font-bold text-foreground">Register New Device</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("flex-1 h-1 rounded-full transition-all",
              s <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm font-medium text-foreground mb-3">Select Hardware Type</p>
              <div className="grid grid-cols-2 gap-3">
                {DEVICE_TYPES.map(type => (
                  <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                    className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      form.type === type
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground")}>
                    <span className="text-xl">{TYPE_ICONS[type]}</span>
                    <span className="text-sm font-medium">{type.replace(/_/g, " ")}</span>
                    {form.type === type && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm font-medium text-foreground mb-3">Device Details</p>
              {[
                { label: "Device Name", key: "name", placeholder: "e.g. ESP32-Warehouse-A01" },
                { label: "Location", key: "location", placeholder: "e.g. Warehouse A, Bay 3" },
                { label: "Firmware Version", key: "firmwareVersion", placeholder: "e.g. 2.4.1" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                  <input
                    value={(form as any)[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
                </div>
              ))}
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm font-medium text-foreground mb-3">Connection Setup</p>
              <div className="glass rounded-xl p-4 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Flash this code to your {form.type.replace(/_/g, " ")}:</p>
                <pre className="text-xs text-cyan-400 font-mono overflow-x-auto">
{`#include <AetherGridSDK.h>

AetherGrid ag("YOUR_API_KEY");

void setup() {
  ag.init("${form.name || "my-device"}");
  ag.setLocation("${form.location || "location"}");
  ag.connect();
}

void loop() {
  ag.sendTelemetry();
  delay(1000);
}`}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Waiting for device connection...
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {step > 1 ? "Back" : "Cancel"}
          </button>
          <button
            onClick={() => step < 3 ? setStep(s => s + 1) : handleAdd()}
            disabled={loading || (step === 2 && !form.name)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {step < 3 ? "Next" : loading ? "Registering..." : "Register Device"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DevicesClient() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<typeof MOCK_DEVICES[0] | null>(null);

  const filtered = MOCK_DEVICES.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    const matchType = typeFilter === "ALL" || d.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: MOCK_DEVICES.length,
    online: MOCK_DEVICES.filter(d => d.status === "ONLINE").length,
    offline: MOCK_DEVICES.filter(d => d.status === "OFFLINE").length,
    warning: MOCK_DEVICES.filter(d => d.status === "WARNING" || d.status === "ERROR").length,
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showAddModal && <AddDeviceModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">IoT Devices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stats.total} devices registered across your fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", icon: <Cpu className="w-4 h-4" /> },
          { label: "Online", value: stats.online, color: "text-green-400", icon: <Wifi className="w-4 h-4" /> },
          { label: "Offline", value: stats.offline, color: "text-slate-400", icon: <WifiOff className="w-4 h-4" /> },
          { label: "Alerts", value: stats.warning, color: "text-yellow-400", icon: <AlertTriangle className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border">
            <div className={cn("flex items-center gap-2 mb-1", s.color)}>
              {s.icon}
              <span className="text-2xl font-bold">{s.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search devices, locations..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
            <option value="ALL">All Status</option>
            {DEVICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
            <option value="ALL">All Types</option>
            {DEVICE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 transition-colors", view === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("px-3 py-2 transition-colors", view === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} device{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Device Grid / List */}
      {view === "grid" ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(device => (
              <DeviceCard key={device.id} device={device} onSelect={() => setSelectedDevice(device)} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden glow-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50">
              <tr>
                {["Device", "Status", "Type", "Location", "Firmware", "Last Seen", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map(device => (
                  <DeviceRow key={device.id} device={device} onSelect={() => setSelectedDevice(device)} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Device Detail Panel */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDevice(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full overflow-y-auto glass border border-border/60 rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-border/50 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
                    {TYPE_ICONS[selectedDevice.type]}
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">{selectedDevice.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedDevice.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedDevice.status} />
                  <button onClick={() => setSelectedDevice(null)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "IP Address", value: selectedDevice.ipAddress },
                    { label: "Location", value: selectedDevice.location },
                    { label: "Firmware", value: selectedDevice.firmwareVersion },
                    { label: "Uptime", value: selectedDevice.uptime },
                    { label: "Temperature", value: `${selectedDevice.temperature}°C` },
                    { label: "Last Seen", value: formatTimeAgo(selectedDevice.lastSeen) },
                  ].map((info, i) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{info.label}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{info.value}</p>
                    </div>
                  ))}
                </div>
                {/* Resource usage */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Resource Usage</h3>
                  <div className="space-y-3">
                    {[
                      { label: "CPU", value: selectedDevice.cpuUsage, color: selectedDevice.cpuUsage > 80 ? "bg-red-400" : "bg-cyan-400" },
                      { label: "Memory", value: selectedDevice.memUsage, color: "bg-violet-400" },
                    ].map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className="text-foreground font-medium">{r.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${r.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Device Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Terminal className="w-4 h-4" />, label: "Remote Shell", color: "cyan" },
                      { icon: <Upload className="w-4 h-4" />, label: "Update Firmware", color: "violet" },
                      { icon: <Power className="w-4 h-4" />, label: "Reboot Device", color: "yellow" },
                      { icon: <Trash2 className="w-4 h-4" />, label: "Deregister", color: "red" },
                    ].map((action, i) => (
                      <button key={i} onClick={() => toast.info(`${action.label} — coming in full deploy`)}
                        className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                          `border-${action.color}-500/20 text-${action.color}-400 hover:bg-${action.color}-500/10`)}>
                        {action.icon} {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
