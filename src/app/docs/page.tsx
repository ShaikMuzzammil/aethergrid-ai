import Link from "next/link";
import { CircuitBoard, ArrowLeft } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <nav className="border-b border-slate-800 bg-[#080c14]/80 backdrop-blur-xl px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <CircuitBoard className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold"><span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Aether</span><span className="text-slate-300">Grid</span></span>
        </Link>
        <Link href="/" className="ml-auto flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">Documentation</h1>
        <p className="text-slate-400 text-lg mb-12">Everything you need to build with AetherGrid AI.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { title: "Quick Start", desc: "Deploy your first device in under 5 minutes.", tag: "Beginner" },
            { title: "REST API Reference", desc: "Full reference for all AetherGrid API endpoints.", tag: "API" },
            { title: "Device SDK", desc: "Integrate ESP32, Raspberry Pi, and Jetson devices.", tag: "SDK" },
            { title: "AI Model Training", desc: "Train and deploy custom edge AI models.", tag: "ML" },
            { title: "Webhook Events", desc: "React to real-time events from your fleet.", tag: "Events" },
            { title: "Team & RBAC", desc: "Manage access control for your organization.", tag: "Admin" },
          ].map((doc) => (
            <div key={doc.title} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/40 transition-colors cursor-pointer">
              <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{doc.tag}</span>
              <h3 className="text-lg font-semibold mt-3 mb-2">{doc.title}</h3>
              <p className="text-slate-400 text-sm">{doc.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 p-6 bg-gradient-to-r from-cyan-500/10 to-violet-600/10 border border-cyan-500/20 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Full documentation coming soon</h2>
          <p className="text-slate-400 text-sm">We&apos;re actively writing comprehensive guides. In the meantime, explore the platform and check the <code className="text-cyan-400 bg-slate-800 px-1 rounded">GUIDE.md</code> in your project root.</p>
          <Link href="/register" className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Get Started Free</Link>
        </div>
      </main>
    </div>
  );
}
