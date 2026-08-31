"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, Eye, EyeOff, AlertCircle, Zap, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"idle"|"connecting"|"authenticating"|"redirecting">("idle");

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (params.get("demo") === "true") { setEmail("demo@aethergrid.ai"); setPassword("DemoPass123!"); }
  }, [params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true); setError(""); setStep("connecting");
    try {
      setStep("authenticating");
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.ok) {
        setStep("redirecting");
        router.replace("/dashboard");
      } else {
        setStep("idle");
        setError(res?.error === "CredentialsSignin"
          ? "Invalid email or password. Try: demo@aethergrid.ai / DemoPass123!"
          : "Login failed. Please try again.");
      }
    } catch { setStep("idle"); setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const fillDemo = () => { setEmail("demo@aethergrid.ai"); setPassword("DemoPass123!"); setError(""); };

  const stepLabel: Record<string,string> = {
    idle:"Sign In", connecting:"Connecting…", authenticating:"Authenticating…", redirecting:"Loading dashboard…"
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none"/>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none"/>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_28px_rgba(0,212,255,0.6)] transition-all">
              <Cpu className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-black text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your edge AI control centre</p>
        </div>

        {/* Demo CTA */}
        <button onClick={fillDemo}
          className="w-full mb-5 p-4 bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-400/20 hover:border-cyan-400/40 rounded-2xl text-left transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-0.5">
                <Zap className="w-3.5 h-3.5"/> Quick Demo Access
              </p>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-mono text-white/70">demo@aethergrid.ai</span> ·{" "}
                <span className="font-mono text-white/70">DemoPass123!</span>
              </p>
            </div>
            <div className="text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Fill <ArrowRight className="w-3 h-3"/>
            </div>
          </div>
        </button>

        <div className="glass rounded-2xl p-7 glow-border">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-400/30 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
                <p className="text-xs text-red-300 leading-snug">{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@company.com" autoComplete="email" autoFocus={!email}
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-cyan-500/20">
              {loading
                ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> {stepLabel[step]}</>
                : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              No account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Create one free →</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <Link href="/" className="hover:text-cyan-400 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"/>
      </div>
    }>
      <LoginForm/>
    </Suspense>
  );
}
