"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">{error.message || "An unexpected error occurred"}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl text-sm font-medium transition-all">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/dashboard" className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
