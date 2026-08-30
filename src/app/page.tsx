"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cpu, Brain, Zap, Shield, BarChart3, Globe, ArrowRight, Github, Check, Menu, X, Star, Activity } from "lucide-react";

const NAV_LINKS = [
  { label:"Features", href:"#features" },
  { label:"How It Works", href:"#how-it-works" },
  { label:"Docs", href:"/docs" },
];

const FEATURES = [
  { icon:<Cpu className="w-6 h-6"/>, title:"Edge Device Management", desc:"Register and monitor thousands of IoT devices in real-time. Supports ESP32, Raspberry Pi, NVIDIA Jetson, STM32, RISC-V and custom hardware.", color:"cyan" },
  { icon:<Brain className="w-6 h-6"/>, title:"AI Model Hub", desc:"Upload, train, and deploy TensorFlow, PyTorch, ONNX, and TFLite models. One-click deployment to edge infrastructure.", color:"violet" },
  { icon:<Zap className="w-6 h-6"/>, title:"Automation Engine", desc:"Visual if-this-then-that rule builder. Automate firmware updates, alerts, scaling, and integrations without code.", color:"amber" },
  { icon:<BarChart3 className="w-6 h-6"/>, title:"Real-time Analytics", desc:"Device telemetry, model performance, and fleet health visualised in live dashboards with custom time ranges.", color:"emerald" },
  { icon:<Shield className="w-6 h-6"/>, title:"Security First", desc:"HMAC-signed webhooks, scoped API keys, RBAC team roles, and 2FA. SOC 2 compliant infrastructure.", color:"rose" },
  { icon:<Globe className="w-6 h-6"/>, title:"8+ Integrations", desc:"Connect Slack, PagerDuty, Datadog, GitHub, Grafana, MQTT, AWS IoT Core and Jira out of the box.", color:"sky" },
];

const STATS = [
  { value:"10M+", label:"Sensor Readings/Day" },
  { value:"99.99%", label:"Platform Uptime" },
  { value:"28ms", label:"Avg Inference Latency" },
  { value:"8+", label:"Integrations" },
];

function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x:-999, y:-999 });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const DEVICE_TYPES = ["ESP32","Jetson","RPi","STM32","Hub","Edge","RISC-V","Arduino"];
    const TYPE_COLORS: Record<string,string> = { Hub:"#00d4ff", Edge:"#7c3aed", ESP32:"#10b981", Jetson:"#f59e0b", RPi:"#ef4444", STM32:"#8b5cf6", "RISC-V":"#06b6d4", Arduino:"#22c55e" };

    const nodes = Array.from({length:48},(_,i)=>{
      const type = DEVICE_TYPES[i%DEVICE_TYPES.length];
      const isHub = type==="Hub"||type==="Edge";
      return {
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
        type, color:TYPE_COLORS[type]||"#00d4ff",
        radius:isHub?10:5+Math.random()*3,
        isHub, pulse:Math.random()*Math.PI*2, pulseSpeed:0.02+Math.random()*0.02,
        load:Math.random(), loadSpd:0.005+Math.random()*0.01,
        loadDir:1, alpha:0.6+Math.random()*0.4,
      };
    });

    const packets: {sx:number;sy:number;tx:number;ty:number;t:number;color:string;speed:number}[] = [];
    const spawnPacket = () => {
      if (packets.length>60) return;
      const si=Math.floor(Math.random()*nodes.length), ti=Math.floor(Math.random()*nodes.length);
      if (si===ti) return;
      const s=nodes[si], t=nodes[ti];
      const dx=t.x-s.x, dy=t.y-s.y;
      if (Math.hypot(dx,dy)>220) return;
      packets.push({sx:s.x,sy:s.y,tx:t.x,ty:t.y,t:0,color:s.color,speed:0.008+Math.random()*0.012});
    };

    const resize = () => {
      W=canvas.width=canvas.offsetWidth;
      H=canvas.height=canvas.offsetHeight;
    };
    window.addEventListener("resize",resize);
    canvas.addEventListener("mousemove",e=>{
      const r=canvas.getBoundingClientRect();
      mouseRef.current={x:e.clientX-r.left,y:e.clientY-r.top};
    });
    canvas.addEventListener("mouseleave",()=>{mouseRef.current={x:-999,y:-999};});

    let frame=0;
    const draw = () => {
      animRef.current=requestAnimationFrame(draw);
      ctx.clearRect(0,0,W,H);
      frame++;
      if (frame%45===0) spawnPacket();

      // Mouse repulsion
      nodes.forEach(n=>{
        const dx=n.x-mouseRef.current.x, dy=n.y-mouseRef.current.y;
        const dist=Math.hypot(dx,dy);
        if (dist<100&&dist>0) { const f=0.5*(1-dist/100); n.vx+=f*dx/dist; n.vy+=f*dy/dist; }
        n.vx*=0.98; n.vy*=0.98;
        n.x+=n.vx; n.y+=n.vy;
        if (n.x<0||n.x>W) n.vx*=-1;
        if (n.y<0||n.y>H) n.vy*=-1;
        n.x=Math.max(0,Math.min(W,n.x));
        n.y=Math.max(0,Math.min(H,n.y));
        n.pulse+=n.pulseSpeed;
        n.load+=n.loadSpd*n.loadDir;
        if (n.load>=1||n.load<=0) n.loadDir*=-1;
      });

      // Edges
      for (let i=0;i<nodes.length;i++) {
        for (let j=i+1;j<nodes.length;j++) {
          const a=nodes[i],b=nodes[j];
          const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy);
          if (dist>200) continue;
          const alpha=(1-dist/200)*0.25;
          const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          grad.addColorStop(0,a.color+Math.round(alpha*255).toString(16).padStart(2,"0"));
          grad.addColorStop(1,b.color+Math.round(alpha*255).toString(16).padStart(2,"0"));
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=grad; ctx.lineWidth=0.8; ctx.stroke();
        }
      }

      // Packets
      for (let i=packets.length-1;i>=0;i--) {
        const p=packets[i];
        p.t+=p.speed;
        if (p.t>=1){packets.splice(i,1);continue;}
        const x=p.sx+(p.tx-p.sx)*p.t, y=p.sy+(p.ty-p.sy)*p.t;
        const grd=ctx.createRadialGradient(x,y,0,x,y,6);
        grd.addColorStop(0,p.color+"ff");
        grd.addColorStop(0.5,p.color+"80");
        grd.addColorStop(1,p.color+"00");
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        // Trail
        const trailLen=5;
        for (let t=1;t<=trailLen;t++) {
          const tt=Math.max(0,p.t-t*0.04);
          const tx2=p.sx+(p.tx-p.sx)*tt, ty2=p.sy+(p.ty-p.sy)*tt;
          ctx.beginPath(); ctx.arc(tx2,ty2,2*(1-t/trailLen),0,Math.PI*2);
          ctx.fillStyle=p.color+Math.round((1-t/trailLen)*60).toString(16).padStart(2,"0");
          ctx.fill();
        }
      }

      // Nodes
      nodes.forEach(n=>{
        const pulseFactor=1+Math.sin(n.pulse)*0.15;
        // Halo
        const halo=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.radius*3*pulseFactor);
        halo.addColorStop(0,n.color+"25");
        halo.addColorStop(1,n.color+"00");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*3*pulseFactor,0,Math.PI*2);
        ctx.fillStyle=halo; ctx.fill();
        // Hub pulse rings
        if (n.isHub) {
          for (let r=1;r<=2;r++) {
            const rs=((frame*0.015+r*0.5)%1)*n.radius*6;
            const a=1-rs/(n.radius*6);
            ctx.beginPath(); ctx.arc(n.x,n.y,rs,0,Math.PI*2);
            ctx.strokeStyle=n.color+Math.round(a*80).toString(16).padStart(2,"0");
            ctx.lineWidth=1; ctx.stroke();
          }
        }
        // Core
        const g=ctx.createRadialGradient(n.x-n.radius*.3,n.y-n.radius*.3,0,n.x,n.y,n.radius*pulseFactor);
        g.addColorStop(0,"#ffffff"); g.addColorStop(0.4,n.color); g.addColorStop(1,n.color+"80");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*pulseFactor,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
        // Load arc
        const arc=n.load*Math.PI*2;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*pulseFactor+3,-Math.PI/2,-Math.PI/2+arc);
        ctx.strokeStyle=n.color+"90"; ctx.lineWidth=2; ctx.stroke();
      });
    };

    draw();
    return ()=>{cancelAnimationFrame(animRef.current);window.removeEventListener("resize",resize);};
  },[]);

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0"/>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-background/90 backdrop-blur-xl border-b border-border/30":"bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white"/>
            </div>
            <span className="text-lg font-black text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l=>(
              <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-all">Sign In</Link>
            <Link href="/dashboard" className="text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl transition-all">
              Go to Dashboard
            </Link>
          </div>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {menuOpen?<X className="w-5 h-5 text-white"/>:<Menu className="w-5 h-5 text-white"/>}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-card border-b border-border/50 px-6 py-4 space-y-2">
            {NAV_LINKS.map(l=>(
              <a key={l.label} href={l.href} onClick={()=>setMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-white py-2">{l.label}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center text-sm border border-border/50 text-white py-2 rounded-xl">Sign In</Link>
              <Link href="/dashboard" className="flex-1 text-center text-sm font-bold bg-cyan-500 text-black py-2 rounded-xl">Dashboard</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0"><NetworkCanvas/></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/30 to-background pointer-events-none"/>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-mono px-4 py-2 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
            {STATS[0].value} sensor readings processed daily
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
            Edge AI<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 animate-gradient-x">
              Infrastructure
            </span><br/>
            at Scale
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The unified platform to register, monitor, and deploy AI models across your entire IoT device fleet — from ESP32 microcontrollers to NVIDIA Jetson edge servers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="group flex items-center justify-center gap-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/25">
              Launch Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/login?demo=true" className="flex items-center justify-center gap-2.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-bold text-base px-8 py-4 rounded-2xl backdrop-blur-sm transition-all">
              Try Demo
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-muted-foreground">
            {["No credit card", "5-min setup", "Open API", "HMAC-secured"].map((t,i)=>(
              <span key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400"/>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30 bg-muted/10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s,i)=>(
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">Everything your edge fleet needs</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">One platform to manage devices, deploy AI models, and automate your entire edge infrastructure.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f,i)=>(
            <div key={i} className="glass rounded-2xl p-6 glow-border hover:border-cyan-400/30 transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/15 flex items-center justify-center text-${f.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/5 border-y border-border/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Up and running in minutes</h2>
            <p className="text-lg text-muted-foreground">No complex setup. Get your first device online in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step:"1", title:"Create Account", desc:"Sign up and get your API key instantly — no card required.", icon:<Shield className="w-6 h-6"/> },
              { step:"2", title:"Register Devices", desc:"Call the REST API or use our SDK to register your IoT devices.", icon:<Cpu className="w-6 h-6"/> },
              { step:"3", title:"Upload Models", desc:"Upload TFLite, ONNX or PyTorch models and link them to your fleet.", icon:<Brain className="w-6 h-6"/> },
              { step:"4", title:"Deploy & Monitor", desc:"One-click deploy with real-time telemetry, alerts, and automation rules.", icon:<Activity className="w-6 h-6"/> },
            ].map((s,i)=>(
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 mb-4">
                  {s.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-black flex items-center justify-center">{s.step}</div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-4">Start managing your edge fleet today</h2>
        <p className="text-lg text-muted-foreground mb-8">Join developers and teams running production AI at the edge with AetherGrid.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="group flex items-center justify-center gap-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/25">
            Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </Link>
          <Link href="/docs" className="flex items-center justify-center gap-2.5 border border-border/50 hover:border-cyan-400/30 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all">
            Read the Docs
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="text-sm font-bold text-white">AetherGrid AI</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {[{l:"Dashboard",h:"/dashboard"},{l:"Docs",h:"/docs"},{l:"API Keys",h:"/settings/api-keys"},{l:"Sign In",h:"/login"}].map(l=>(
              <Link key={l.l} href={l.h} className="hover:text-white transition-all">{l.l}</Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© 2025 AetherGrid AI · Built by Nova</p>
        </div>
      </footer>
    </div>
  );
}
