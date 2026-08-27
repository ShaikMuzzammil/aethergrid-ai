"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard, Mail, Lock, User, Eye, EyeOff, Loader2, Check, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordChecks = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(form.password) },
    { label: "Contains uppercase letter", ok: /[A-Z]/.test(form.password) },
    { label: "Contains special character", ok: /[^a-zA-Z0-9]/.test(form.password) },
  ];
  const allChecks = passwordChecks.every(c => c.ok);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecks) {
      toast.error("Password does not meet all requirements.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.error) ? data.error.map((e: { message: string }) => e.message).join(", ") : data.error || "Registration failed");

      toast.success("Account created! Signing you in…");
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.info("Account created. Please sign in.");
        router.push("/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

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
        <Link href="/login" className="text-sm text-muted-foreground hover:text-white font-medium transition-colors">
          Sign in
        </Link>
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">Create your account</h1>
            <p className="text-muted-foreground text-sm">Start deploying edge AI in minutes — free forever</p>
          </div>

          <div className="glass rounded-2xl p-8 glow-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={form.name} onChange={update("name")} required minLength={2}
                    placeholder="Nova Muzzammil"
                    className="w-full bg-muted/20 border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={form.email} onChange={update("email")} required
                    placeholder="you@company.com"
                    className="w-full bg-muted/20 border border-border/60 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} required minLength={8}
                    placeholder="Create a strong password"
                    className="w-full bg-muted/20 border border-border/60 rounded-xl pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {form.password && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {passwordChecks.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        {c.ok
                          ? <Check className="w-3 h-3 text-green-400 shrink-0" />
                          : <X className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                        <span className={`text-[10px] ${c.ok ? "text-green-400" : "text-muted-foreground/60"}`}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/legal/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and{" "}
                <Link href="/legal/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Free Account →"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mt-5">
            {["Free forever tier", "No credit card", "Full API access"].map((t, i) => (
              <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                <Check className="w-3 h-3 text-green-400/60" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
