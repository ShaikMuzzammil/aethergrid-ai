"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  Cpu, Brain, Zap, Shield, BarChart3, Globe, ArrowRight,
  Check, Menu, X, Activity, ChevronRight, Radio, Terminal, Layers
} from "lucide-react";

/* ─── Network Canvas ────────────────────────────────────────── */
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const TYPES = ["ESP32","Jetson","RPi","STM32","Hub","Edge","RISC-V","Arduino"];
    const COLORS: Record<string,string> = {
      Hub:"#00d4ff", Edge:"#7c3aed", ESP32:"#10b981", Jetson:"#f59e0b",
      RPi:"#ef4444", STM32:"#8b5cf6", "RISC-V":"#06b6d4", Arduino:"#22c55e"
    };

    const nodes = Array.from({length:52},(_,i)=>{
      const type = TYPES[i%TYPES.length];
      const isHub = type==="Hub"||type==="Edge";
      return {
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
        type, color: COLORS[type]||"#00d4ff",
        radius: isHub ? 10 : 4+Math.random()*3,
        isHub, pulse: Math.random()*Math.PI*2, pulseSpd: 0.018+Math.random()*0.018,
        load: Math.random(), loadSpd: 0.004+Math.random()*0.008, loadDir: 1,
      };
    });

    const packets: {sx:number;sy:number;tx:number;ty:number;t:number;color:string;spd:number}[] = [];
    const spawnPacket = () => {
      if (packets.length>55) return;
      const si=Math.floor(Math.random()*nodes.length), ti=Math.floor(Math.random()*nodes.length);
      if (si===ti) return;
      const s=nodes[si],t=nodes[ti];
      if (Math.hypot(t.x-s.x,t.y-s.y)>230) return;
      packets.push({sx:s.x,sy:s.y,tx:t.x,ty:t.y,t:0,color:s.color,spd:0.007+Math.random()*0.011});
    };

    const resize = () => { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
    const onMM = (e:MouseEvent) => { const r=canvas.getBoundingClientRect(); mouseRef.current={x:e.clientX-r.left,y:e.clientY-r.top}; };
    const onML = () => { mouseRef.current={x:-999,y:-999}; };
    window.addEventListener("resize",resize);
    canvas.addEventListener("mousemove",onMM);
    canvas.addEventListener("mouseleave",onML);

    let frame=0;
    const draw = () => {
      animRef.current=requestAnimationFrame(draw);
      ctx.clearRect(0,0,W,H);
      frame++;
      if(frame%40===0) spawnPacket();

      nodes.forEach(n=>{
        const dx=n.x-mouseRef.current.x, dy=n.y-mouseRef.current.y;
        const dist=Math.hypot(dx,dy);
        if(dist<120&&dist>0){const f=0.55*(1-dist/120);n.vx+=f*dx/dist;n.vy+=f*dy/dist;}
        n.vx*=0.98; n.vy*=0.98;
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
        n.x=Math.max(0,Math.min(W,n.x)); n.y=Math.max(0,Math.min(H,n.y));
        n.pulse+=n.pulseSpd;
        n.load+=n.loadSpd*n.loadDir;
        if(n.load>=1||n.load<=0) n.loadDir*=-1;
      });

      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j];
        const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy);
        if(dist>210) continue;
        const alpha=(1-dist/210)*0.22;
        const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        grad.addColorStop(0,a.color+Math.round(alpha*255).toString(16).padStart(2,"0"));
        grad.addColorStop(1,b.color+Math.round(alpha*255).toString(16).padStart(2,"0"));
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=grad; ctx.lineWidth=0.7; ctx.stroke();
      }

      for(let i=packets.length-1;i>=0;i--){
        const p=packets[i]; p.t+=p.spd;
        if(p.t>=1){packets.splice(i,1);continue;}
        const x=p.sx+(p.tx-p.sx)*p.t, y=p.sy+(p.ty-p.sy)*p.t;
        const grd=ctx.createRadialGradient(x,y,0,x,y,5);
        grd.addColorStop(0,p.color+"ff"); grd.addColorStop(0.5,p.color+"80"); grd.addColorStop(1,p.color+"00");
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
        for(let t=1;t<=4;t++){
          const tt=Math.max(0,p.t-t*0.04);
          const tx2=p.sx+(p.tx-p.sx)*tt, ty2=p.sy+(p.ty-p.sy)*tt;
          ctx.beginPath(); ctx.arc(tx2,ty2,2*(1-t/4),0,Math.PI*2);
          ctx.fillStyle=p.color+Math.round((1-t/4)*55).toString(16).padStart(2,"0"); ctx.fill();
        }
      }

      nodes.forEach(n=>{
        const pf=1+Math.sin(n.pulse)*0.14;
        const halo=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.radius*3.2*pf);
        halo.addColorStop(0,n.color+"22"); halo.addColorStop(1,n.color+"00");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*3.2*pf,0,Math.PI*2); ctx.fillStyle=halo; ctx.fill();
        if(n.isHub){ for(let r=1;r<=2;r++){
          const rs=((frame*0.014+r*0.5)%1)*n.radius*7;
          const a=1-rs/(n.radius*7);
          ctx.beginPath(); ctx.arc(n.x,n.y,rs,0,Math.PI*2);
          ctx.strokeStyle=n.color+Math.round(a*70).toString(16).padStart(2,"0"); ctx.lineWidth=1; ctx.stroke();
        }}
        const g=ctx.createRadialGradient(n.x-n.radius*.3,n.y-n.radius*.3,0,n.x,n.y,n.radius*pf);
        g.addColorStop(0,"#ffffff"); g.addColorStop(0.4,n.color); g.addColorStop(1,n.color+"80");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*pf,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        const arc=n.load*Math.PI*2;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*pf+3,-Math.PI/2,-Math.PI/2+arc);
        ctx.strokeStyle=n.color+"88"; ctx.lineWidth=2; ctx.stroke();
      });
    };
    draw();
    return ()=>{cancelAnimationFrame(animRef.current);window.removeEventListener("resize",resize);canvas.removeEventListener("mousemove",onMM);canvas.removeEventListener("mouseleave",onML);};
  },[]);

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />;
}

/* ─── Animated Counter ──────────────────────────────────────── */
function Counter({ target, suffix="" }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const num = parseFloat(target.replace(/[^0-9.]/g,""));
      const isFloat = target.includes(".");
      let start = 0; const dur = 1800; const step = 16;
      const id = setInterval(() => {
        start += dur/step;
        const pct = Math.min(start/dur,1);
        const ease = 1-Math.pow(1-pct,3);
        const val = num*ease;
        setDisplay((isFloat ? val.toFixed(2) : Math.floor(val).toString()) + (target.match(/[^0-9.]+/)?.[0]||""));
        if(pct>=1) clearInterval(id);
      }, step);
    }, { threshold: 0.5 });
    if(ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <div ref={ref}>{display}{suffix}</div>;
}

/* ─── Scroll Reveal ─────────────────────────────────────────── */
function Reveal({ children, delay=0, className="" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVisible(true);obs.disconnect();} }, {threshold:0.15});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── Typing Effect ─────────────────────────────────────────── */
function Typewriter({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const word = words[wordIdx];
    const delay = deleting ? 40 : charIdx === word.length ? 1800 : 70;
    const id = setTimeout(() => {
      if (!deleting && charIdx < word.length) { setDisplay(word.slice(0,charIdx+1)); setCharIdx(i=>i+1); }
      else if (!deleting && charIdx === word.length) { setDeleting(true); }
      else if (deleting && charIdx > 0) { setDisplay(word.slice(0,charIdx-1)); setCharIdx(i=>i-1); }
      else { setDeleting(false); setWordIdx(i=>(i+1)%words.length); }
    }, delay);
    return () => clearTimeout(id);
  }, [charIdx, deleting, wordIdx, words]);
  return <span>{display}<span className="animate-pulse text-cyan-400">|</span></span>;
}

const FEATURES = [
  { icon: <Cpu className="w-6 h-6"/>, title:"Edge Device Fleet", desc:"Register and monitor thousands of IoT devices. Supports ESP32, Raspberry Pi, NVIDIA Jetson, STM32, RISC-V and custom hardware with sub-second status updates.", color:"cyan", stat:"52 device types" },
  { icon: <Brain className="w-6 h-6"/>, title:"AI Model Hub", desc:"Upload, version, and deploy TensorFlow, PyTorch, ONNX and TFLite models to edge devices in one click. Track accuracy, latency, and usage per deployment.", color:"violet", stat:"6 ML frameworks" },
  { icon: <Radio className="w-6 h-6"/>, title:"Live Simulator", desc:"Simulate real-time IoT telemetry for any registered device — four modes including chaos mode — to test automations and alert thresholds before production.", color:"emerald", stat:"4 simulation modes" },
  { icon: <Zap className="w-6 h-6"/>, title:"Automation Engine", desc:"Visual if-this-then-that rule builder. Automate firmware OTA, incident alerts, auto-scaling, and webhook triggers without writing a line of code.", color:"amber", stat:"12 trigger types" },
  { icon: <BarChart3 className="w-6 h-6"/>, title:"Real-time Analytics", desc:"Canvas-rendered live charts for CPU, memory, temperature, and model latency across any time range from 1 hour to 30 days with CSV export.", color:"sky", stat:"5 time windows" },
  { icon: <Shield className="w-6 h-6"/>, title:"Security & RBAC", desc:"HMAC-signed webhooks, scoped API keys with permission matrices, OWNER/ADMIN/MEMBER/VIEWER roles, and SOC 2–compliant infrastructure.", color:"rose", stat:"4-tier RBAC" },
  { icon: <Layers className="w-6 h-6"/>, title:"8+ Integrations", desc:"One-click connect to Slack, PagerDuty, Datadog, GitHub, Grafana, MQTT, AWS IoT Core, and Jira. Config modals with live test pings.", color:"purple", stat:"8 providers" },
  { icon: <Terminal className="w-6 h-6"/>, title:"Open REST API", desc:"Full API reference with copy-ready curl, Python, Node.js and ESP32 Arduino examples. HMAC authentication. Versioned endpoints with semantic stability guarantees.", color:"teal", stat:"26 endpoints" },
];

const STEPS = [
  { n:"01", title:"Register your devices", desc:"Paste our 3-line Arduino/Python snippet into your firmware. Device appears in dashboard in seconds.", icon:<Cpu className="w-5 h-5"/> },
  { n:"02", title:"Upload your AI model", desc:"Drag your .tflite / .onnx / .pt model into the Model Hub. We handle compression, versioning and storage.", icon:<Brain className="w-5 h-5"/> },
  { n:"03", title:"Deploy to the edge", desc:"Select devices, set CPU/memory limits, pick a region, press Deploy. Rolling update — zero downtime.", icon:<Layers className="w-5 h-5"/> },
  { n:"04", title:"Monitor & automate", desc:"Live telemetry arrives in real time. Set thresholds, wire automations, get Slack alerts in under a minute.", icon:<Activity className="w-5 h-5"/> },
];

const STATS = [
  { value:"10M+", label:"Sensor Readings/Day" },
  { value:"99.99%", label:"Platform Uptime" },
  { value:"28ms", label:"Avg Inference Latency" },
  { value:"8+", label:"Integrations" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [liveCount, setLiveCount] = useState(2847);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  useEffect(()=>{
    const id = setInterval(()=>setLiveCount(c=>c+Math.floor(Math.random()*12)+1),2000);
    return ()=>clearInterval(id);
  },[]);

  const NAV = [
    {label:"Features",href:"#features"},
    {label:"How It Works",href:"#how-it-works"},
    {label:"Docs",href:"/docs"},
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 overflow-x-hidden">
      <style>{`
        @keyframes gradient-x{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .animate-gradient-x{background-size:200%;animation:gradient-x 4s ease infinite}
        .animate-float{animation:float 3s ease-in-out infinite}
        .cyber-grid{background-image:linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px);background-size:40px 40px}
        .glass{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(12px)}
        .gradient-text{background:linear-gradient(135deg,#00d4ff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .feature-card:hover .feature-icon{transform:scale(1.1) rotate(-3deg)}
      `}</style>

      {/* Sticky Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-[#060a14]/95 backdrop-blur-xl border-b border-white/5":"bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(0,212,255,0.4)]">
              <Cpu className="w-4 h-4 text-white"/>
            </div>
            <span className="text-lg font-black text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(l=>(
              <a key={l.label} href={l.href} className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-all">Sign In</Link>
            <Link href="/dashboard" className="text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/20">
              Go to Dashboard
            </Link>
          </div>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {menuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}
          </button>
        </div>
        {menuOpen&&(
          <div className="md:hidden bg-[#0a0e1a] border-b border-border/40 px-6 py-4 space-y-2">
            {NAV.map(l=>(
              <a key={l.label} href={l.href} onClick={()=>setMenuOpen(false)} className="block text-sm text-slate-400 hover:text-white py-2">{l.label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center text-sm border border-border/50 text-white py-2.5 rounded-xl">Sign In</Link>
              <Link href="/dashboard" className="flex-1 text-center text-sm font-bold bg-cyan-500 text-black py-2.5 rounded-xl">Dashboard</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="cyber-grid absolute inset-0 opacity-50"/>
        <div className="absolute inset-0"><NetworkCanvas/></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a14]/10 via-[#060a14]/20 to-[#060a14] pointer-events-none"/>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-28">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-[#0a1628]/80 border border-cyan-400/30 text-cyan-400 text-xs font-mono px-4 py-2 rounded-full mb-8 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
            <span className="text-white font-bold">{liveCount.toLocaleString()}</span> sensor readings processed this minute
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-4 tracking-tight">
            Edge AI<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 animate-gradient-x">
              <Typewriter words={["Infrastructure","Intelligence","Automation","Observability"]}/>
            </span><br/>
            at Scale
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed mt-6">
            The unified platform to register, monitor, and deploy AI models across your entire IoT device fleet — from ESP32 microcontrollers to NVIDIA Jetson edge servers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="group flex items-center justify-center gap-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base px-9 py-4 rounded-2xl transition-all shadow-2xl shadow-cyan-500/30">
              Launch Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/login?demo=true" className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-base px-9 py-4 rounded-2xl backdrop-blur transition-all">
              <Activity className="w-4 h-4 text-cyan-400"/> Try Live Demo
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs text-slate-500">
            {["No credit card","5-min setup","Open API","HMAC-secured","Free tier"].map((t,i)=>(
              <span key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400"/>{t}</span>
            ))}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-float"/>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s,i)=>(
            <Reveal key={i} delay={i*80} className="text-center">
              <div className="text-4xl font-black text-white mb-1">
                <Counter target={s.value}/>
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-20">
          <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-4">Platform Capabilities</div>
          <h2 className="text-5xl font-black text-white mb-5">Everything your edge fleet needs</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">One platform to manage devices, simulate telemetry, deploy AI models, and automate your entire edge infrastructure.</p>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f,i)=>(
            <Reveal key={i} delay={i*50} className="feature-card glass rounded-2xl p-6 hover:border-cyan-400/25 hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className={`feature-icon w-12 h-12 rounded-2xl bg-${f.color}-500/12 flex items-center justify-center text-${f.color}-400 mb-4 transition-transform duration-300`}>
                {f.icon}
              </div>
              <div className={`text-[10px] font-mono text-${f.color}-400 mb-2`}>{f.stat}</div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <div className="text-xs font-mono text-violet-400 tracking-widest uppercase mb-4">Get Started</div>
            <h2 className="text-5xl font-black text-white mb-4">Up and running in 5 minutes</h2>
            <p className="text-lg text-slate-400">No complex setup. Get your first device online in under 5 minutes.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s,i)=>(
              <Reveal key={i} delay={i*100}>
                <div className="relative glass rounded-2xl p-6 h-full">
                  <div className="text-5xl font-black text-white/5 absolute top-4 right-5 font-mono">{s.n}</div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-4">{s.icon}</div>
                  <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                  {i < STEPS.length-1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-cyan-400/40"/>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-28 max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <div className="glass rounded-3xl p-16 border border-cyan-400/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none"/>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"/>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"/>
            <div className="relative z-10">
              <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-4">Start Free</div>
              <h2 className="text-4xl font-black text-white mb-4">Deploy your first edge model today</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">No credit card. Full platform access. Connect unlimited devices on the free tier.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/25">
                  Create free account <ArrowRight className="w-5 h-5"/>
                </Link>
                <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all">
                  <Activity className="w-4 h-4 text-cyan-400"/> Live Demo
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="text-sm font-black text-white">AetherGrid AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
          <div className="text-xs text-slate-600">© 2026 AetherGrid AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
