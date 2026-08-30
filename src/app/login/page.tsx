"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, Eye, EyeOff, AlertCircle, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (status === "authenticated") router.push("/dashboard"); }, [status, router]);

  // Auto-fill demo if ?demo=true
  useEffect(() => {
    if (params.get("demo")) {
      setEmail("demo@aethergrid.ai");
      setPassword("DemoPass123!");
    }
  }, [params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true); setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.ok) { router.push("/dashboard"); router.refresh(); }
      else {
        // Retry once (demo user auto-created on first attempt)
        if (email === "demo@aethergrid.ai") {
          const retry = await signIn("credentials", { email, password, redirect: false });
          if (retry?.ok) { router.push("/dashboard"); return; }
        }
        setError("Invalid credentials. Check your email and password.");
      }
    } catch { setError("Login failed. Please try again."); }
    finally { setLoading(false); }
  };

  const fillDemo = () => { setEmail("demo@aethergrid.ai"); setPassword("DemoPass123!"); setError(""); };

  if (status === "loading") return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none"/>
      <div className="fixed inset-0 bg-radial-hero pointer-events-none"/>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Cpu className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-black text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your edge AI control centre</p>
        </div>

        {/* Demo badge */}
        <div className="mb-5 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5"/> Demo Account
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                <span className="font-mono text-white">demo@aethergrid.ai</span> · <span className="font-mono text-white">DemoPass123!</span>
              </p>
            </div>
            <button onClick={fillDemo} className="text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg transition-all">
              Use Demo
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-7 glow-border">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" autoComplete="email"
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Create one free</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-cyan-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
