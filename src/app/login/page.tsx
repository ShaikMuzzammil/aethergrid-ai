"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo() {
    setError("");
    setDemoLoading(true);
    const DEMO_EMAIL = "demo@aethergrid.ai";
    const DEMO_PASS  = "DemoPass123!";
    try {
      toast.info("Signing in to demo account…");

      // Try direct sign-in first (user may already exist)
      let result = await signIn("credentials", {
        email: DEMO_EMAIL, password: DEMO_PASS, redirect: false,
      });

      // If failed, auto-register the demo user then try again
      if (result?.error) {
        toast.info("Setting up demo account…");
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASS }),
        });
        const data = await res.json();

        if (!res.ok && !data.error?.toLowerCase().includes("already")) {
          setError(data.error || "Demo setup failed. Ensure your database is configured.");
          setDemoLoading(false);
          return;
        }

        result = await signIn("credentials", {
          email: DEMO_EMAIL, password: DEMO_PASS, redirect: false,
        });
      }

      if (result?.error) {
        setError("Demo login failed. The database may not be connected — check your Vercel environment variables.");
      } else {
        toast.success("Welcome to AetherGrid AI!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <CircuitBoard className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm text-white">AetherGrid AI</span>
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <CircuitBoard className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your AetherGrid account</p>
          </div>

          {/* Demo Button */}
          <button
            onClick={loginAsDemo}
            disabled={demoLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 mb-6 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/60 text-cyan-300 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {demoLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Zap className="w-4 h-4 group-hover:text-cyan-200" />}
            {demoLoading ? "Setting up demo…" : "Try Demo Account — instant access"}
          </button>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground px-2">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:bg-muted/80 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:bg-muted/80 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-400 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || demoLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo creds hint */}
        <div className="mt-4 p-3 rounded-xl bg-card/40 border border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            Demo: <code className="text-cyan-400">demo@aethergrid.ai</code> / <code className="text-cyan-400">DemoPass123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
