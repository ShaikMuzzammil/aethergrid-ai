"use client";
import Link from "next/link";
import { CircuitBoard, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
          <CircuitBoard className="w-8 h-8 text-white" />
        </div>
        <div className="text-7xl font-black gradient-text mb-3">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
          This page doesn&apos;t exist in the grid. Check the URL or navigate back to safety.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:from-cyan-400 hover:to-violet-500">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 border border-border/60 hover:border-cyan-400/40 text-muted-foreground hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
