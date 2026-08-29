"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard, Mail, Lock, User, Eye, EyeOff, Loader2, Check, ArrowLeft, X, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const passwordChecks = [
    { label: "At least 8 characters",      ok: form.password.length >= 8 },
    { label: "Contains a number",           ok: /\d/.test(form.password) },
    { label: "Contains uppercase letter",   ok: /[A-Z]/.test(form.password) },
    { label: "Contains special character",  ok: /[^a-zA-Z0-9]/.test(form.password) },
  ];
  const allChecks = passwordChecks.every(c => c.ok);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecks) { setError("Password does not meet all requirements."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.error) ? data.error.map((e: {message:string}) => e.message).join(". ") : data.error || "Registration failed.");
        return;
      }
      toast.success("Account created! Signing you in…");
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.ok) { router.push("/dashboard"); router.refresh(); }
      else { toast.info("Account created. Please sign in."); router.push("/login"); }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <CircuitBoard className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
        </Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-white font-medium transition-colors">
          Sign in
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm">Start deploying edge AI in minutes — free forever</p>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-2xl">
          {/* Demo shortcut */}
          <Link href="/login" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-xs font-semibold transition-all">
            <Zap className="w-3.5 h-3.5" /> Already have an account? Try the demo instead →
          </Link>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.name} onChange={update("name")} required minLength={2}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/60 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={update("email")} required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/60 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} required minLength={8}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/60 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-400 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {form.password && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {passwordChecks.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {c.ok
                        ? <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        : <X className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                      <span className={`text-[10px] ${c.ok ? "text-emerald-400" : "text-muted-foreground/60"}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/legal/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and{" "}
              <Link href="/legal/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : "Create Free Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-5 mt-4">
          {["Free forever","No credit card","Full API access"].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="w-3 h-3 text-emerald-400" />{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
