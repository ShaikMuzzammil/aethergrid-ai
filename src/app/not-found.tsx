"use client";
import Link from "next/link";
import { CircuitBoard, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="text-center relative">
        <div className="text-[120px] font-black leading-none gradient-text">404</div>
        <div className="flex items-center justify-center gap-2 mt-2 mb-6">
          <CircuitBoard className="w-5 h-5 text-muted-foreground" />
          <p className="text-muted-foreground">This edge node doesn&apos;t exist — or has gone offline</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-cyan-400 hover:to-violet-500 transition-all">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
