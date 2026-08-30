"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, Eye, EyeOff, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("All fields required"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:form.name, email:form.email, password:form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      const signInRes = await signIn("credentials", { email:form.email, password:form.password, redirect:false });
      if (signInRes?.ok) router.push("/dashboard");
      else router.push("/login");
    } catch { setError("Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  const requirements = [
    { met: form.password.length >= 8, label: "At least 8 characters" },
    { met: form.password === form.confirm && form.confirm.length > 0, label: "Passwords match" },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4">
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none"/>
      <div className="fixed inset-0 bg-radial-hero pointer-events-none"/>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Cpu className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-black text-white">AetherGrid <span className="text-cyan-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start managing your edge AI fleet</p>
        </div>

        <div className="glass rounded-2xl p-7 glow-border">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {[
              { key:"name",    label:"Full Name",        type:"text",     placeholder:"Your name" },
              { key:"email",   label:"Email",            type:"email",    placeholder:"you@company.com" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass?"text":"password"} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 pr-11 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e=>setForm(p=>({...p,confirm:e.target.value}))}
                placeholder="Repeat password"
                className="w-full px-4 py-3 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/60 transition-all"/>
            </div>

            {form.password.length > 0 && (
              <div className="space-y-1.5">
                {requirements.map((r,i)=>(
                  <div key={i} className={`flex items-center gap-2 text-[11px] ${r.met?"text-green-400":"text-muted-foreground"}`}>
                    <Check className={`w-3 h-3 ${r.met?"text-green-400":"text-muted-foreground/30"}`}/> {r.label}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              {loading?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Creating account...</>:"Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</Link>
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
