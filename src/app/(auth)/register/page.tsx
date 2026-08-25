"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircuitBoard, Mail, Lock, User, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  const checks = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(form.password) },
    { label: "Contains uppercase", ok: /[A-Z]/.test(form.password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      toast.success("Account created! Signing you in...");
      const result = await signIn("credentials", {
        email: form.email, password: form.password, redirect: false
      });
      if (result?.ok) router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <CircuitBoard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl"><span className="gradient-text">Aether</span><span className="text-slate-300">Grid</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm">Start deploying AI to edge devices in minutes</p>
        </div>
        <div className="glass rounded-2xl p-8 glow-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={form.name} onChange={update("name")} required
                  placeholder="John Doe" minLength={2}
                  className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={update("email")} required
                  placeholder="you@company.com"
                  className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} required
                  placeholder="Choose a strong password" minLength={8}
                  className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {checks.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3 h-3 ${c.ok ? "text-green-400" : "text-border"}`} />
                      <span className={c.ok ? "text-green-400" : "text-muted-foreground"}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-4">
                By creating an account, you agree to our{" "}
                <Link href="/legal/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          🔒 Free forever tier · No credit card required
        </p>
      </div>
    </div>
  );
}
