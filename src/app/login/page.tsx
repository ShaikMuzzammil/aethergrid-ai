"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo() {
    setDemoLoading(true);
    const DEMO_EMAIL = "demo@aethergrid.ai";
    const DEMO_PASS  = "DemoPass123!";
    try {
      // First try signing in (demo user may already exist)
      let result = await signIn("credentials", { email: DEMO_EMAIL, password: DEMO_PASS, redirect: false });

      if (result?.error) {
        // Auto-create demo user
        toast.info("Setting up demo account…");
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Demo User", email: DEMO_EMAIL, password: DEMO_PASS }),
        });
        const data = await res.json();
        if (!res.ok && !data.error?.toLowerCase().includes("already")) {
          toast.error(data.error || "Could not create demo account. Check DB config.");
          setDemoLoading(false);
          return;
        }
        // Try signing in again
        result = await signIn("credentials", { email: DEMO_EMAIL, password: DEMO_PASS, redirect: false });
      }

      if (result?.ok) {
        toast.success("Demo account ready! Welcome to AetherGrid.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Demo login failed — ensure DATABASE_URL is set in Vercel.");
      }
    } catch {
      toast.error("Demo login error. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  }

  const anyLoading = loading || demoLoading;

  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <CircuitBoard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-sm">
            <span className="gradient-text">Aether</span><span className="text-slate-300">Grid</span>
          </span>
        </Link>
        <Link href="/register" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
          Sign up free →
        </Link>
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your AetherGrid console</p>
          </div>

          <div className="glass rounded-2xl p-8 glow-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-muted/20 border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full bg-muted/20 border border-border/60 rounded-xl pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">Forgot password?</span>
                </div>
              </div>

              <button type="submit" disabled={anyLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign In"}
              </button>
            </form>

            <div className="relative flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-border/40" />
              <span className="text-xs text-muted-foreground font-mono">OR</span>
              <div className="flex-1 border-t border-border/40" />
            </div>

            <button onClick={loginAsDemo} disabled={anyLoading}
              className="w-full border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-300 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {demoLoading ? "Setting up demo…" : "⚡ Try Demo Account (Instant)"}
            </button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign up free</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground/40 mt-5">
            🔒 Secured with NextAuth · JWT sessions · Zero plaintext storage
          </p>
        </div>
      </div>
    </div>
  );
}
