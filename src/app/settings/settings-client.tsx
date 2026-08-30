"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  User, Lock, Bell, Palette, Settings, Shield, Globe,
  Check, Save, Eye, EyeOff, Sun, Moon, LogOut
} from "lucide-react";

const TABS = [
  { id:"profile", label:"Profile", icon:<User className="w-4 h-4"/> },
  { id:"security", label:"Security", icon:<Lock className="w-4 h-4"/> },
  { id:"notifications", label:"Notifications", icon:<Bell className="w-4 h-4"/> },
  { id:"appearance", label:"Appearance", icon:<Palette className="w-4 h-4"/> },
  { id:"advanced", label:"Advanced", icon:<Settings className="w-4 h-4"/> },
];

const TIMEZONES = ["UTC","America/New_York","America/Chicago","America/Los_Angeles","Europe/London","Europe/Paris","Asia/Kolkata","Asia/Tokyo","Australia/Sydney"];
const LANGUAGES = [{code:"en",label:"English"},{code:"es",label:"Español"},{code:"fr",label:"Français"},{code:"de",label:"Deutsch"},{code:"ja",label:"日本語"},{code:"zh",label:"中文"}];

export default function SettingsClient() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name:"", bio:"", timezone:"UTC", language:"en" });
  const [notifications, setNotifications] = useState({ notifyEmail:true, notifyPush:true, notifySlack:false });
  const [appearance, setAppearance] = useState({ theme:"dark" });
  const [security, setSecurity] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPass, setShowPass] = useState<Record<string,boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/profile");
        if (!res.ok) return;
        const data = await res.json();
        setProfile({ name: data.name||"", bio: data.bio||"", timezone: data.timezone||"UTC", language: data.language||"en" });
        setNotifications({ notifyEmail: data.notifyEmail??true, notifyPush: data.notifyPush??true, notifySlack: data.notifySlack??false });
        setAppearance({ theme: data.theme||"dark" });
        setLoaded(true);
      } catch {}
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:profile.name, bio:profile.bio, timezone:profile.timezone, language:profile.language }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      await updateSession({ name: profile.name });
      toast.success("Profile updated!");
    } catch (e:any) { toast.error(e.message||"Failed"); }
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
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const saveAppearance = async () => {
    setSaving(true);
    try {
      await fetch("/api/users/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ theme: appearance.theme }) });
      toast.success("Appearance saved!");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) { toast.error("Fill in all fields"); return; }
    if (security.newPassword !== security.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (security.newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ currentPassword:security.currentPassword, newPassword:security.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      toast.success("Password changed!");
      setSecurity({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (e:any) { toast.error(e.message||"Failed"); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50 transition-all";
  const labelCls = "text-xs font-semibold text-muted-foreground mb-1 block";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account, preferences, and security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 space-y-1 shrink-0">
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab===tab.id?"bg-cyan-500/15 text-cyan-400 border border-cyan-400/30":"text-muted-foreground hover:text-white hover:bg-muted/30"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <div className="pt-4 border-t border-border/30">
            <button onClick={()=>signOut({callbackUrl:"/login"})} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4"/> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Profile Settings</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center border border-cyan-400/20 text-2xl font-black text-cyan-400">
                  {profile.name ? profile.name[0].toUpperCase() : (session?.user?.email?.[0]?.toUpperCase()||"?")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{session?.user?.name||"Demo User"}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              <div>
                <label className={labelCls}>Display Name</label>
                <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Your name" className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Bio</label>
                <textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="Short bio..." rows={3}
                  className={`${inputCls} resize-none`}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Timezone</label>
                  <select value={profile.timezone} onChange={e=>setProfile(p=>({...p,timezone:e.target.value}))} className={inputCls}>
                    {TIMEZONES.map(tz=><option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Language</label>
                  <select value={profile.language} onChange={e=>setProfile(p=>({...p,language:e.target.value}))} className={inputCls}>
                    {LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Profile
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="glass rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-white">Security</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-cyan-400"/>Change Password</h3>
                {[
                  {key:"currentPassword",label:"Current Password",placeholder:"Enter current password"},
                  {key:"newPassword",label:"New Password",placeholder:"Minimum 8 characters"},
                  {key:"confirmPassword",label:"Confirm New Password",placeholder:"Repeat new password"},
                ].map(f=>(
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPass[f.key]?"text":"password"}
                        value={(security as any)[f.key]}
                        onChange={e=>setSecurity(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        className={`${inputCls} pr-10`}/>
                      <button onClick={()=>setShowPass(p=>({...p,[f.key]:!p[f.key]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        {showPass[f.key]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={changePassword} disabled={saving} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                  {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Shield className="w-4 h-4"/>} Update Password
                </button>
              </div>
              <div className="border-t border-border/30 pt-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-amber-400"/>Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground mb-4">Add an extra layer of security with TOTP authentication.</p>
                <div className="flex items-center justify-between p-4 glass rounded-xl border border-border/30">
                  <div>
                    <p className="text-sm font-semibold text-white">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or any TOTP app</p>
                  </div>
                  <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-1 rounded-full font-mono">Not Enabled</span>
                </div>
              </div>
              <div className="border-t border-border/30 pt-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-green-400"/>Active Sessions</h3>
                <div className="p-4 glass rounded-xl border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Current Session</p>
                    <p className="text-xs text-muted-foreground">This device · JWT Session</p>
                  </div>
                  <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-1 rounded-full flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  {key:"notifyEmail",label:"Email Notifications",desc:"Receive alerts and reports via email"},
                  {key:"notifyPush",label:"Push Notifications",desc:"Browser push notifications for critical events"},
                  {key:"notifySlack",label:"Slack Notifications",desc:"Forward alerts to your connected Slack workspace"},
                ].map(n=>(
                  <div key={n.key} className="flex items-center justify-between p-4 glass rounded-xl border border-border/30 hover:border-cyan-400/20 transition-all">
                    <div>
                      <p className="text-sm font-semibold text-white">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <button onClick={()=>setNotifications(p=>({...p,[n.key]:!(p as any)[n.key]}))}
                      className={`relative w-11 h-6 rounded-full transition-all ${(notifications as any)[n.key]?"bg-cyan-500":"bg-muted"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${(notifications as any)[n.key]?"left-5":"left-0.5"}`}/>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Alert Thresholds</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {[
                    {label:"Device Offline Alert After",value:"10 minutes"},
                    {label:"CPU Alert Threshold",value:"85%"},
                    {label:"Memory Alert Threshold",value:"90%"},
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between p-3 glass rounded-xl border border-border/20">
                      <span>{item.label}</span>
                      <span className="text-white font-mono text-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={saveNotifications} disabled={saving} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Preferences
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Appearance</h2>
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[{value:"dark",label:"Dark",icon:<Moon className="w-5 h-5"/>},{value:"light",label:"Light",icon:<Sun className="w-5 h-5"/>}].map(t=>(
                    <button key={t.value} onClick={()=>setAppearance({theme:t.value})}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${appearance.theme===t.value?"border-cyan-400 bg-cyan-400/10":"border-border/30 hover:border-cyan-400/30"}`}>
                      <span className={appearance.theme===t.value?"text-cyan-400":"text-muted-foreground"}>{t.icon}</span>
                      <span className={`text-sm font-semibold ${appearance.theme===t.value?"text-white":"text-muted-foreground"}`}>{t.label}</span>
                      {appearance.theme===t.value && <Check className="w-4 h-4 text-cyan-400 ml-auto"/>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-border/30 pt-4">
                <h3 className="text-sm font-semibold text-white mb-3">Density</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Compact","Default","Comfortable"].map((d,i)=>(
                    <button key={d} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${i===1?"border-cyan-400/30 bg-cyan-400/10 text-cyan-400":"border-border/30 text-muted-foreground hover:border-cyan-400/20"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <button onClick={saveAppearance} disabled={saving} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-xl transition-all">
                {saving?<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>:<Save className="w-4 h-4"/>} Save Appearance
              </button>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white">Advanced Settings</h2>
              <div className="space-y-3">
                {[
                  {label:"Data Retention Period",desc:"How long to keep device telemetry",value:"90 days"},
                  {label:"Export Format Default",desc:"Default format for data exports",value:"CSV"},
                  {label:"Webhook Timeout",desc:"Max wait time for webhook responses",value:"30 seconds"},
                  {label:"API Rate Limit",desc:"Max API requests per minute",value:"1,000 req/min"},
                ].map((item,i)=>(
                  <div key={i} className="flex items-center justify-between p-4 glass rounded-xl border border-border/30">
                    <div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
                <div className="p-4 border border-red-400/20 rounded-xl bg-red-400/5">
                  <p className="text-sm font-semibold text-white mb-1">Delete Account</p>
                  <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all data. This cannot be undone.</p>
                  <button className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 px-4 py-2 rounded-lg transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
