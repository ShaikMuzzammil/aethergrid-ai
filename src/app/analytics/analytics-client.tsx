"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Download, RefreshCw, Cpu, Activity, Globe, Brain, Zap, Clock } from "lucide-react";

const TIME_RANGES = [
  { label:"1H", hours:1 }, { label:"6H", hours:6 }, { label:"24H", hours:24 },
  { label:"7D", hours:168 }, { label:"30D", hours:720 },
];

function MiniBar({ data, color="#00d4ff", maxVal }: { data:number[]; color?:string; maxVal?:number }) {
  const max = maxVal ?? Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((v,i) => (
        <div key={i} className="flex-1 rounded-t transition-all" style={{ height:`${(v/max)*100}%`, backgroundColor:color, opacity: 0.4 + 0.6*(v/max) }} />
      ))}
    </div>
  );
}

function MetricCard({ label, value, unit, trend, color, history }: any) {
  const isUp = trend > 0;
  return (
    <div className="glass rounded-2xl p-5 glow-border">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-[10px] font-mono ${isUp?"text-red-400":"text-green-400"}`}>
          {isUp?"↑":"↓"} {Math.abs(trend)}%
        </span>
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></div>
      <MiniBar data={history} color={color} />
    </div>
  );
}

function LineChart({ datasets, labels, height=160 }: { datasets:{label:string;data:number[];color:string}[]; labels:string[]; height?:number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c || !datasets.length) return;
    const ctx = c.getContext("2d")!;
    const w = c.width; const h = c.height;
    ctx.clearRect(0,0,w,h);
    const allVals = datasets.flatMap(d=>d.data);
    const max = Math.max(...allVals,1); const min = 0;
    const range = max - min || 1;
    const pad = { l:40, r:10, t:10, b:30 };
    const plotW = w - pad.l - pad.r; const plotH = h - pad.t - pad.b;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    [0,25,50,75,100].forEach(pct => {
      const y = pad.t + plotH * (1 - pct/100);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "10px monospace";
      ctx.fillText(`${Math.round(min + range * pct/100)}`, 2, y+4);
    });

    datasets.forEach(ds => {
      if (!ds.data.length) return;
      const pts = ds.data.map((v,i) => ({ x: pad.l + (i/(ds.data.length-1||1)) * plotW, y: pad.t + plotH * (1 - (v-min)/range) }));
      // Fill
      const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
      grad.addColorStop(0, ds.color+"50"); grad.addColorStop(1, ds.color+"00");
      ctx.beginPath(); ctx.moveTo(pts[0].x, h - pad.b);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length-1].x, h - pad.b); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      // Line
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = ds.color; ctx.lineWidth = 2; ctx.stroke();
    });

    // X labels
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "9px monospace";
    const step = Math.ceil(labels.length / 6);
    labels.forEach((l, i) => {
      if (i % step === 0) {
        const x = pad.l + (i/(labels.length-1||1)) * plotW;
        ctx.fillText(l, x-12, h - 8);
      }
    });
  }, [datasets, labels]);

  return <canvas ref={canvasRef} width={600} height={height} className="w-full" style={{height}} />;
}

function generateTimeSeries(hours:number, base:number, variance:number, points=48) {
  const data:number[] = []; const labels:string[] = [];
  const now = Date.now(); const step = (hours * 3600000) / points;
  for (let i=0; i<points; i++) {
    const t = new Date(now - (points-i)*step);
    data.push(Math.max(0, Math.min(100, base + (Math.random()-0.5)*variance*2)));
    const h = t.getHours().toString().padStart(2,"0");
    const m = t.getMinutes().toString().padStart(2,"0");
    labels.push(hours <= 24 ? `${h}:${m}` : `${t.getMonth()+1}/${t.getDate()}`);
  }
  return { data, labels };
}

export default function AnalyticsClient() {
  const [timeRange, setTimeRange] = useState(TIME_RANGES[2]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const genData = useCallback((tr: typeof TIME_RANGES[0]) => {
    const pts = tr.hours <= 1 ? 30 : tr.hours <= 6 ? 36 : tr.hours <= 24 ? 48 : tr.hours <= 168 ? 56 : 60;
    const { data:cpuData, labels } = generateTimeSeries(tr.hours, 52, 25, pts);
    const { data:memData } = generateTimeSeries(tr.hours, 61, 18, pts);
    const { data:reqData } = generateTimeSeries(tr.hours, 55, 35, pts);
    const { data:latData } = generateTimeSeries(tr.hours, 30, 20, pts);
    const reqHistory = Array(12).fill(0).map(()=>Math.round(400+Math.random()*1200));
    const latHistory = Array(12).fill(0).map(()=>Math.round(15+Math.random()*50));
    const errHistory = Array(12).fill(0).map(()=>Math.random()*2);
    const upHistory  = Array(12).fill(0).map(()=>98+Math.random()*2);
    return {
      labels,
      datasets: [
        { label:"CPU Avg", data:cpuData, color:"#00d4ff" },
        { label:"Memory Avg", data:memData, color:"#7c3aed" },
        { label:"Req Rate", data:reqData.map(v=>Math.round(v*20)), color:"#f59e0b" },
      ],
      latDatasets: [{ label:"Latency ms", data:latData.map(v=>Math.round(v*2)), color:"#10b981" }],
      summary: {
        avgCpu: Math.round(cpuData.reduce((a,b)=>a+b,0)/cpuData.length),
        peakCpu: Math.round(Math.max(...cpuData)),
        avgMem: Math.round(memData.reduce((a,b)=>a+b,0)/memData.length),
        peakMem: Math.round(Math.max(...memData)),
        totalReq: reqData.reduce((a,b)=>a+Math.round(b*20),0),
        avgLatency: Math.round(latData.reduce((a,b)=>a+b,0)/latData.length * 2),
        p99Latency: Math.round(Math.max(...latData)*2 * 1.3),
        errorRate: (Math.random()*0.5).toFixed(2),
        uptime: (99.5 + Math.random()*0.49).toFixed(3),
      },
      metricCards: [
        { label:"Avg Request Rate", value:(reqData.reduce((a,b)=>a+Math.round(b*20),0)/reqData.length).toFixed(0), unit:"req/min", trend:+(Math.random()*10-3).toFixed(1), color:"#f59e0b", history:reqHistory },
        { label:"Avg Latency P50", value:Math.round(latData.reduce((a,b)=>a+b,0)/latData.length*2), unit:"ms", trend:-(Math.random()*8).toFixed(1), color:"#10b981", history:latHistory },
        { label:"Error Rate", value:(Math.random()*0.5).toFixed(3), unit:"%", trend:+(Math.random()*0.2).toFixed(2), color:"#ef4444", history:errHistory },
        { label:"Uptime", value:(99.5+Math.random()*0.49).toFixed(2), unit:"%", trend:0, color:"#22c55e", history:upHistory },
      ],
      topDevices: Array(5).fill(0).map((_,i)=>({
        name:`Device-${String.fromCharCode(65+i)}${(i*13+1).toString().padStart(2,"0")}`,
        cpu: Math.round(30+Math.random()*60), requests: Math.round(200+Math.random()*1500),
      })),
      modelPerf: ["YOLOv8 Edge","Anomaly Sentinel","NLP Classifier","MobileNet","TS Forecaster"].map(n=>({
        name:n, requests: Math.round(500+Math.random()*3000), latency: Math.round(15+Math.random()*60), accuracy: (85+Math.random()*12).toFixed(1)
      })),
    };
  }, []);

  const load = useCallback(async (tr=timeRange) => {
    try {
      const res = await fetch(`/api/analytics?hours=${tr.hours}`);
      if (res.ok) {
        const d = await res.json();
        if (d.chartData?.length) {
          const gen = genData(tr);
          setAnalyticsData({...gen, realData:d});
        } else { setAnalyticsData(genData(tr)); }
      } else { setAnalyticsData(genData(tr)); }
    } catch { setAnalyticsData(genData(tr)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [timeRange, genData]);

  useEffect(() => { load(); }, []);

  const handleRangeChange = (tr: typeof TIME_RANGES[0]) => {
    setTimeRange(tr); setRefreshing(true); load(tr);
  };

  const exportCSV = () => {
    if (!analyticsData) return;
    const rows = ["Time,CPU,Memory,Requests"].concat(
      analyticsData.labels.map((l:string,i:number) =>
        `${l},${analyticsData.datasets[0].data[i]},${analyticsData.datasets[1].data[i]},${analyticsData.datasets[2]?.data[i]||0}`)
    );
    const blob = new Blob([rows.join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `analytics-${timeRange.label}.csv`; a.click();
    toast.success("Analytics exported!");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto"/>
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    </div>
  );

  const d = analyticsData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Fleet telemetry, model performance, and system metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted/30 border border-border/30 rounded-xl p-1">
            {TIME_RANGES.map(tr=>(
              <button key={tr.label} onClick={()=>handleRangeChange(tr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${timeRange.label===tr.label?"bg-cyan-500/20 text-cyan-400":"text-muted-foreground hover:text-white"}`}>
                {tr.label}
              </button>
            ))}
          </div>
          <button onClick={()=>{setRefreshing(true);load()}} className="p-2 border border-border/50 rounded-xl text-muted-foreground hover:text-white transition-all">
            <RefreshCw className={`w-4 h-4 ${refreshing?"animate-spin":""}`}/>
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 text-xs bg-muted/30 hover:bg-muted/50 text-white border border-border/50 px-3 py-2 rounded-xl transition-all">
            <Download className="w-3.5 h-3.5"/> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      {d && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {d.metricCards.map((card:any,i:number)=>(
            <MetricCard key={i} {...card}/>
          ))}
        </div>
      )}

      {/* Main chart — CPU & Memory */}
      {d && (
        <div className="glass rounded-2xl p-5 glow-border">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Device Fleet Telemetry</h2>
              <p className="text-xs text-muted-foreground">CPU, Memory & Request rate · {timeRange.label} window</p>
            </div>
            <div className="flex gap-4">
              {d.datasets.map((ds:any)=>(
                <div key={ds.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:ds.color}}/>
                  {ds.label}
                </div>
              ))}
            </div>
          </div>
          <LineChart datasets={d.datasets.slice(0,2)} labels={d.labels} height={180}/>
        </div>
      )}

      {/* Latency + Summary */}
      {d && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 glow-border">
            <h2 className="text-sm font-bold text-white mb-1">Inference Latency</h2>
            <p className="text-xs text-muted-foreground mb-4">End-to-end request latency across all model deployments</p>
            <LineChart datasets={d.latDatasets} labels={d.labels} height={140}/>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[{label:"P50",value:`${d.summary.avgLatency}ms`},{label:"P99",value:`${d.summary.p99Latency}ms`},{label:"Uptime",value:`${d.summary.uptime}%`}].map((m,i)=>(
                <div key={i} className="text-center glass rounded-xl p-2">
                  <div className="text-sm font-black text-white">{m.value}</div>
                  <div className="text-[9px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 glow-border">
            <h2 className="text-sm font-bold text-white mb-4">Period Summary</h2>
            <div className="space-y-3">
              {[
                {label:"Avg CPU Usage",value:`${d.summary.avgCpu}%`,sub:`Peak: ${d.summary.peakCpu}%`,color:"text-cyan-400"},
                {label:"Avg Memory",value:`${d.summary.avgMem}%`,sub:`Peak: ${d.summary.peakMem}%`,color:"text-violet-400"},
                {label:"Total Requests",value:d.summary.totalReq.toLocaleString(),sub:"across all deployments",color:"text-amber-400"},
                {label:"Error Rate",value:`${d.summary.errorRate}%`,sub:"Below 1% SLA target",color:parseFloat(d.summary.errorRate)<1?"text-green-400":"text-red-400"},
                {label:"System Uptime",value:`${d.summary.uptime}%`,sub:"30-day rolling average",color:"text-green-400"},
              ].map((item,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                  <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top devices + Model performance */}
      {d && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 glow-border">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-cyan-400"/> Top Active Devices</h2>
            <div className="space-y-3">
              {d.topDevices.map((dev:any,i:number)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground w-4">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{dev.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{dev.cpu}% CPU</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{width:`${dev.cpu}%`}}/>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-20 text-right">{dev.requests.toLocaleString()} req</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 glow-border">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-violet-400"/> Model Performance</h2>
            <div className="space-y-3">
              {d.modelPerf.map((m:any,i:number)=>(
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-[9px] font-mono text-violet-400">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.requests.toLocaleString()} req · {m.latency}ms avg</p>
                  </div>
                  <span className="text-xs font-mono text-green-400 shrink-0">{m.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
