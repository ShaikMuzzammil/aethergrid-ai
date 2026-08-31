"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Play, Pause, Cpu, Thermometer, MemoryStick, Zap, Activity,
  Plus, Trash2, RefreshCw, Settings2, Wifi, WifiOff, Radio
} from "lucide-react";

interface Device { id: string; name: string; type: string; status: string; cpu: number; memory: number; temperature: number; }
interface SimConfig {
  deviceId: string;
  deviceName: string;
  running: boolean;
  interval: number;
  mode: "normal" | "spike" | "degraded" | "chaos";
  cpu: number;
  memory: number;
  temp: number;
  history: { t: string; cpu: number; mem: number; tmp: number }[];
}

const MODE_CONFIG = {
  normal:   { label: "Normal",   color: "text-green-400",  bg: "bg-green-400/10",  desc: "Steady baseline metrics" },
  spike:    { label: "CPU Spike",color: "text-amber-400",  bg: "bg-amber-400/10",  desc: "Periodic CPU spikes" },
  degraded: { label: "Degraded", color: "text-red-400",    bg: "bg-red-400/10",    desc: "High memory + temp" },
  chaos:    { label: "Chaos",    color: "text-violet-400", bg: "bg-violet-400/10", desc: "Random extreme values" },
};

function MiniChart({ data, key_ }: { data: { cpu: number; mem: number; tmp: number }[]; key_: "cpu"|"mem"|"tmp" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (data.length < 2) return;
    const vals = data.map(d => key_ === "tmp" ? d[key_] : d[key_]);
    const max = Math.max(...vals, 1); const min = Math.min(...vals, 0); const range = max - min || 1;
    const color = key_ === "cpu" ? "#00d4ff" : key_ === "mem" ? "#7c3aed" : "#f59e0b";
    const pts = vals.map((v, i) => ({ x: (i / (vals.length - 1)) * c.width, y: c.height - ((v - min) / range) * c.height * 0.85 - c.height * 0.05 }));
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, color + "40"); grad.addColorStop(1, color + "00");
    ctx.beginPath(); ctx.moveTo(pts[0].x, c.height); pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, c.height); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  }, [data, key_]);
  return <canvas ref={ref} width={200} height={50} className="w-full h-12" />;
}

export default function SimulatorClient() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sims, setSims] = useState<SimConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDeviceId, setAddDeviceId] = useState("");
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    fetch("/api/simulator").then(r => r.json()).then(d => {
      setDevices(d.devices || []);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { Object.values(intervalsRef.current).forEach(clearInterval); };
  }, []);

  const generateReadings = (sim: SimConfig) => {
    let cpu = sim.cpu, mem = sim.memory, tmp = sim.temp;
    switch (sim.mode) {
      case "normal":
        cpu = Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 10));
        mem = Math.max(10, Math.min(85, mem + (Math.random() - 0.5) * 5));
        tmp = Math.max(20, Math.min(65, tmp + (Math.random() - 0.5) * 2));
        break;
      case "spike":
        cpu = Math.random() > 0.8 ? 90 + Math.random() * 9 : Math.max(20, cpu + (Math.random() - 0.5) * 15);
        mem = Math.max(30, Math.min(80, mem + (Math.random() - 0.5) * 6));
        tmp = Math.max(30, Math.min(70, tmp + (Math.random() - 0.4) * 3));
        break;
      case "degraded":
        cpu = Math.max(60, Math.min(95, cpu + (Math.random() - 0.3) * 12));
        mem = Math.max(75, Math.min(98, mem + (Math.random() - 0.2) * 8));
        tmp = Math.max(55, Math.min(85, tmp + (Math.random() - 0.3) * 4));
        break;
      case "chaos":
        cpu = Math.random() * 100; mem = Math.random() * 100; tmp = 15 + Math.random() * 80;
        break;
    }
    return { cpu: Math.round(cpu), mem: Math.round(mem), tmp: parseFloat(tmp.toFixed(1)) };
  };

  const startSim = useCallback((simId: string) => {
    setSims(prev => {
      const sim = prev.find(s => s.deviceId === simId);
      if (!sim) return prev;
      const tick = async () => {
        const { cpu, mem, tmp } = generateReadings(sim);
        try {
          await fetch("/api/simulator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId: simId,
              readings: [
                { metric: "cpu", value: cpu, unit: "%" },
                { metric: "memory", value: mem, unit: "%" },
                { metric: "temperature", value: tmp, unit: "°C" },
              ],
            }),
          });
        } catch {}
        setSims(p => p.map(s => {
          if (s.deviceId !== simId) return s;
          const now = new Date().toLocaleTimeString();
          const newH = [...s.history, { t: now, cpu, mem, tmp }].slice(-30);
          return { ...s, cpu, memory: mem, temp: tmp, history: newH };
        }));
      };
      tick();
      intervalsRef.current[simId] = setInterval(tick, sim.interval * 1000);
      return prev.map(s => s.deviceId === simId ? { ...s, running: true } : s);
    });
  }, []);

  const stopSim = useCallback((simId: string) => {
    clearInterval(intervalsRef.current[simId]);
    delete intervalsRef.current[simId];
    setSims(prev => prev.map(s => s.deviceId === simId ? { ...s, running: false } : s));
  }, []);

  const addSim = () => {
    if (!addDeviceId) { toast.error("Select a device"); return; }
    if (sims.find(s => s.deviceId === addDeviceId)) { toast.error("Already simulating this device"); return; }
    const dev = devices.find(d => d.id === addDeviceId);
    if (!dev) return;
    const newSim: SimConfig = {
      deviceId: dev.id, deviceName: dev.name, running: false, interval: 3,
      mode: "normal", cpu: dev.cpu || 40, memory: dev.memory || 50, temp: dev.temperature || 35, history: [],
    };
    setSims(prev => [...prev, newSim]);
    setAddDeviceId("");
    toast.success(`Simulator added for ${dev.name}`);
  };

  const removeSim = (simId: string) => {
    stopSim(simId);
    setSims(prev => prev.filter(s => s.deviceId !== simId));
  };

  const updateSimMode = (simId: string, mode: SimConfig["mode"]) => {
    const wasRunning = sims.find(s => s.deviceId === simId)?.running;
    if (wasRunning) stopSim(simId);
    setSims(prev => prev.map(s => s.deviceId === simId ? { ...s, mode } : s));
    if (wasRunning) setTimeout(() => startSim(simId), 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" /> Device Simulator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simulate real-time IoT telemetry for testing automations, alerts &amp; analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={addDeviceId} onChange={e => setAddDeviceId(e.target.value)}
            className="bg-muted/30 border border-border/50 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-cyan-400/50 min-w-[200px]">
            <option value="">Select device to simulate…</option>
            {devices.filter(d => !sims.find(s => s.deviceId === d.id)).map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.type.replace("_", " ")})</option>
            ))}
          </select>
          <button onClick={addSim} disabled={!addDeviceId}
            className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold px-4 py-2.5 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Simulator
          </button>
        </div>
      </div>

      {sims.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border border-dashed border-border/50">
          <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-2">No simulators running</h3>
          <p className="text-sm text-muted-foreground">Select a device above to start simulating real-time telemetry</p>
        </div>
      )}

      <div className="grid xl:grid-cols-2 gap-6">
        {sims.map(sim => {
          const mCfg = MODE_CONFIG[sim.mode];
          return (
            <div key={sim.deviceId} className="glass rounded-2xl p-5 glow-border space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${sim.running ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
                  <div>
                    <div className="text-sm font-bold text-white">{sim.deviceName}</div>
                    <div className={`text-[10px] font-mono ${mCfg.color}`}>{mCfg.label} · {mCfg.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => sim.running ? stopSim(sim.deviceId) : startSim(sim.deviceId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sim.running ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}>
                    {sim.running ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5" /> Start</>}
                  </button>
                  <button onClick={() => removeSim(sim.deviceId)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mode selector */}
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(MODE_CONFIG) as [SimConfig["mode"], typeof MODE_CONFIG["normal"]][]).map(([m, cfg]) => (
                  <button key={m} onClick={() => updateSimMode(sim.deviceId, m)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sim.mode === m ? `${cfg.bg} ${cfg.color} border border-current/30` : "text-muted-foreground hover:bg-muted/30"}`}>
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Current metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Cpu className="w-4 h-4" />, label: "CPU", value: `${sim.cpu}%`, color: "#00d4ff", warn: sim.cpu > 80 },
                  { icon: <MemoryStick className="w-4 h-4" />, label: "RAM", value: `${sim.memory}%`, color: "#7c3aed", warn: sim.memory > 85 },
                  { icon: <Thermometer className="w-4 h-4" />, label: "Temp", value: `${sim.temp}°C`, color: "#f59e0b", warn: sim.temp > 65 },
                ].map((m, i) => (
                  <div key={i} className={`glass rounded-xl p-3 border ${m.warn ? "border-red-400/30 bg-red-400/5" : "border-border/20"}`}>
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: m.color }}>
                      {m.icon} <span className="text-[10px] font-mono">{m.label}</span>
                    </div>
                    <div className={`text-xl font-black ${m.warn ? "text-red-400" : "text-white"}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              {sim.history.length > 1 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-muted-foreground">Live Telemetry (last {sim.history.length} samples)</div>
                  <MiniChart data={sim.history} key_="cpu" />
                  <div className="grid grid-cols-2 gap-2">
                    <MiniChart data={sim.history} key_="mem" />
                    <MiniChart data={sim.history} key_="tmp" />
                  </div>
                </div>
              )}

              {/* Interval */}
              <div className="flex items-center gap-3 pt-1 border-t border-border/20">
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Push every</span>
                <select value={sim.interval} onChange={e => setSims(prev => prev.map(s => s.deviceId === sim.deviceId ? { ...s, interval: Number(e.target.value) } : s))}
                  disabled={sim.running}
                  className="bg-muted/30 border border-border/40 rounded text-xs text-white px-2 py-1 focus:outline-none disabled:opacity-50">
                  <option value={1}>1 second</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
                {sim.running && (
                  <span className="text-[10px] font-mono text-green-400 ml-auto flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {sim.history.length} pushed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
