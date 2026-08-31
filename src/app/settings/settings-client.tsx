"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  User, Lock, Bell, Palette, Settings, Shield, Globe,
  Check, Save, Eye, EyeOff, Sun, Moon, LogOut, AlertTriangle,
  Monitor, Zap, Database, Clock, ToggleLeft
} from "lucide-react";

const TABS = [
  { id:"profile",       label:"Profile",        icon:<User className="w-4 h-4"/> },
  { id:"security",      label:"Security",        icon:<Lock className="w-4 h-4"/> },
  { id:"notifications", label:"Notifications",   icon:<Bell className="w-4 h-4"/> },
  { id:"appearance",    label:"Appearance",      icon:<Palette className="w-4 h-4"/> },
  { id:"advanced",      label:"Advanced",        icon:<Settings className="w-4 h-4"/> },
];

const TIMEZONES = ["UTC","America/New_York","America/Chicago","America/Los_Angeles","Europe/London","Europe/Paris","Asia/Kolkata","Asia/Tokyo","Australia/Sydney"];
const LANGUAGES = [{code:"en",label:"English"},{code:"es",label:"Español"},{code:"fr",label:"Français"},{code:"de",label:"Deutsch"},{code:"ja",label:"日本語"},{code:"zh",label:"中文"}];

export default function SettingsClient() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name:"", bio:"", timezone:"UTC", language:"en" });
  const [notifications, setNotifications] = useState({ notifyEmail:true, notifyPush:true, notifySlack:false });
  const [appearance, setAppearance] = useState({ theme:"dark", density:"default" });
  const [security, setSecurity] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPass, setShowPass] = useState<Record<string,boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/profile");
        if (!res.ok) return;
        const d = await res.json();
        setProfile({ name: d.name||"", bio: d.bio||"", timezone: d.timezone||"UTC", language: d.language||"en" });
        setNotifications({ notifyEmail: d.notifyEmail??true, notifyPush: d.notifyPush??true, notifySlack: d.notifySlack??false });
        setAppearance({ theme: d.theme||"dark", density: d.density||"default" });
        setLoaded(true);
      } catch {}
    };
    load();
  }, []);

  const saveProfile = async () => {
    if (!profile.name.trim()) { toast.error("Display name cannot be empty"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:profile.name, bio:profile.bio, timezone:profile.timezone, language:profile.language }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      await updateSession({ name: profile.name });
      toast.success("Profile updated!");
    } catch (e:any) { toast.error(e.message||"Failed to save profile"); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(notifications),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Notification preferences saved!");
    } catch { toast.error("Failed to save preferences"); }
    finally { setSaving(false); }
  };

  const saveAppearance = async () => {
    setSaving(true);
    try {
      await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ theme: appearance.theme, density: appearance.density }),
      });
      toast.success("Appearance saved!");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) { toast.error("All password fields required"); return; }
    if (security.newPassword !== security.confirmPassword) { toast.error("New passwords do not match"); return; }
    if (security.newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (security.newPassword === security.currentPassword) { toast.error("New password must differ from current"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ currentPassword:security.currentPassword, newPassword:security.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      toast.success("Password changed successfully!");
      setSecurity({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (e:any) { toast.error(e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const ic = "w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50 transition-all";
  const lc = "text-xs font-semibold text-muted-foreground mb-1.5 block";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, preferences, and security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 space-y-1 shrink-0">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab===t.id?"bg-cyan-500/15 text-cyan-400 border border-cyan-400/30":"text-muted-foreground hover:text-white hover:bg-muted/30"}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <div className="pt-4 border-t border-border/30 space-y-1">
            <button onClick={()=>signOut({callbackUrl:"/"})}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4"/> Sign Out
            </button>
          </div>
        </div>

        {/* Content panels */}
        <div className="flex-1 space-y-4">

          {/* ── Profile ── */}
          {activeTab==="profile" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Profile Settings</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center border border-cyan-400/20 text-2xl font-black text-cyan-400">
                  {profile.name?profile.name[0].toUpperCase():(session?.user?.email?.[0]?.toUpperCase()||"?")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{session?.user?.name||"Demo User"}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {(session?.user as any)?.role || "USER"}
                  </span>
                </div>
              </div>
              <div>
                <label className={lc}>Display Name</label>
                <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Your name" className={ic}/>
              </div>
              <div>
                <label className={lc}>Bio</label>
                <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="Short bio…" rows={3} className={`${ic} resize-none`}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Timezone</label>
                  <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))} className={ic}>
                    {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Language</label>
                  <select value={profile.language} onChange={e=>setProfile(p=>({...p,language:e.target.value}))} className={ic}>
                    {LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Profile
              </button>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab==="security" && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Security</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-400"/>Change Password</h3>
                {[
                  {key:"currentPassword",label:"Current Password",ph:"Enter current password"},
                  {key:"newPassword",label:"New Password",ph:"Minimum 8 characters"},
                  {key:"confirmPassword",label:"Confirm New Password",ph:"Repeat new password"},
                ].map(f=>(
                  <div key={f.key}>
                    <label className={lc}>{f.label}</label>
                    <div className="relative">
                      <input type={showPass[f.key]?"text":"password"} value={(security as any)[f.key]}
                        onChange={e=>setSecurity(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.ph} className={`${ic} pr-10`}/>
                      <button type="button" onClick={()=>setShowPass(p=>({...p,[f.key]:!p[f.key]}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                        {showPass[f.key]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={changePassword} disabled={saving}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                  {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Shield className="w-4 h-4"/>} Update Password
                </button>
              </div>
              <div className="border-t border-border/30 pt-5 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-amber-400"/>Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground">Add an extra layer of security with TOTP authentication.</p>
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-border/30">
                  <div>
                    <p className="text-sm font-semibold text-white">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Google Authenticator, Authy, or any TOTP app</p>
                  </div>
                  <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-1 rounded-full font-mono border border-amber-400/20">Not Enabled</span>
                </div>
              </div>
              <div className="border-t border-border/30 pt-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-green-400"/>Active Sessions</h3>
                <div className="p-4 glass rounded-xl border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Current Session</p>
                    <p className="text-xs text-muted-foreground">This device · JWT Session · {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-1 rounded-full flex items-center gap-1 border border-green-400/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab==="notifications" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  {key:"notifyEmail",label:"Email Notifications",desc:"Receive alerts, digests, and reports via email"},
                  {key:"notifyPush",label:"Browser Notifications",desc:"Push notifications for critical device events"},
                  {key:"notifySlack",label:"Slack Notifications",desc:"Forward alerts to your connected Slack workspace"},
                ].map(n=>(
                  <div key={n.key} className="flex items-center justify-between p-4 glass rounded-xl border border-border/30 hover:border-cyan-400/20 transition-all">
                    <div>
                      <p className="text-sm font-semibold text-white">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <button onClick={()=>setNotifications(p=>({...p,[n.key]:!(p as any)[n.key]}))}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${(notifications as any)[n.key]?"bg-cyan-500":"bg-muted"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${(notifications as any)[n.key]?"left-5":"left-0.5"}`}/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Alert Thresholds</h3>
                <div className="space-y-2">
                  {[
                    {label:"Device Offline Alert After",value:"10 minutes",icon:<Clock className="w-3.5 h-3.5"/>},
                    {label:"CPU Alert Threshold",value:"85%",icon:<Zap className="w-3.5 h-3.5"/>},
                    {label:"Memory Alert Threshold",value:"90%",icon:<Database className="w-3.5 h-3.5"/>},
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between p-3 glass rounded-xl border border-border/20">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-cyan-400">{item.icon}</span>{item.label}
                      </div>
                      <span className="text-white font-mono text-xs bg-muted/30 px-2 py-1 rounded border border-border/30">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={saveNotifications} disabled={saving}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Preferences
              </button>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab==="appearance" && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Appearance</h2>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {value:"dark",label:"Dark",icon:<Moon className="w-5 h-5"/>},
                    {value:"light",label:"Light",icon:<Sun className="w-5 h-5"/>},
                    {value:"system",label:"System",icon:<Monitor className="w-5 h-5"/>},
                  ].map(t=>(
                    <button key={t.value} onClick={()=>setAppearance(a=>({...a,theme:t.value}))}
                      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${appearance.theme===t.value?"border-cyan-400 bg-cyan-400/10":"border-border/30 hover:border-cyan-400/30"}`}>
                      <span className={appearance.theme===t.value?"text-cyan-400":"text-muted-foreground"}>{t.icon}</span>
                      <span className={`text-sm font-semibold ${appearance.theme===t.value?"text-white":"text-muted-foreground"}`}>{t.label}</span>
                      {appearance.theme===t.value&&<Check className="w-4 h-4 text-cyan-400"/>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">UI Density</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["compact","default","comfortable"].map(d=>(
                    <button key={d} onClick={()=>setAppearance(a=>({...a,density:d}))}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${appearance.density===d?"border-cyan-400/30 bg-cyan-400/10 text-cyan-400":"border-border/30 text-muted-foreground hover:border-cyan-400/20 hover:text-white"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveAppearance} disabled={saving}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Appearance
              </button>
            </div>
          )}

          {/* ── Advanced ── */}
          {activeTab==="advanced" && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Advanced Settings</h2>
              <div className="space-y-2">
                {[
                  {label:"Data Retention Period",desc:"How long to keep device telemetry",value:"90 days"},
                  {label:"Export Format Default",desc:"Default format for data exports",value:"CSV"},
                  {label:"Webhook Timeout",desc:"Max wait time for webhook responses",value:"30s"},
                  {label:"API Rate Limit",desc:"Max API requests per minute",value:"1,000 req/min"},
                  {label:"Simulator Push Interval",desc:"Default push interval for device simulator",value:"3 seconds"},
                ].map((item,i)=>(
                  <div key={i} className="flex items-center justify-between p-4 glass rounded-xl border border-border/30 hover:border-cyan-400/10 transition-all">
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-1 rounded">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-5">
                <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4"/> Danger Zone
                </h3>
                <div className="p-5 border border-red-400/20 rounded-xl bg-red-400/5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Delete Account</p>
                    <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                    <div className="flex items-center gap-3">
                      <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="px-3 py-2 bg-muted/20 border border-red-400/20 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-400/50 w-52"/>
                      <button disabled={deleteConfirm!=="DELETE"}
                        onClick={()=>{if(deleteConfirm==="DELETE"){toast.error("Account deletion is disabled in demo mode");}}}
                        className="text-xs bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg transition-all">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
