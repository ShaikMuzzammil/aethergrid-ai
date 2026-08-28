"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Shield, Bell, Palette, Globe, Trash2,
  Camera, Check, RefreshCw, Eye, EyeOff, Moon, Sun,
  Smartphone, Mail, Slack, Webhook, ToggleLeft, ToggleRight, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "advanced", label: "Advanced", icon: Globe },
];

type NotifKey = "deviceAlerts" | "modelComplete" | "deploymentEvents" | "securityAlerts" | "teamActivity" | "weeklyDigest";
interface NotifPrefs { deviceAlerts: boolean; modelComplete: boolean; deploymentEvents: boolean; securityAlerts: boolean; teamActivity: boolean; weeklyDigest: boolean; }

export function SettingsClient({ user }: { user: any }) {
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", bio: "", timezone: "Asia/Kolkata", language: "en" });
  const [notifs, setNotifs] = useState<NotifPrefs>({ deviceAlerts: true, modelComplete: true, deploymentEvents: true, securityAlerts: true, teamActivity: false, weeklyDigest: true });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "", twoFA: false });
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("cyan");
  const [compactMode, setCompactMode] = useState(false);

  async function save() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    toast.success("Settings saved successfully!");
    setSaving(false);
  }

  function Input({ label, value, onChange, type = "text", placeholder = "" }: any) {
    return (
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
      </div>
    );
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!value)}>
        {value ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
      </button>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account, preferences, and security</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                  tab === t.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 glass rounded-2xl glow-border overflow-hidden">
          {/* Profile */}
          {tab === "profile" && (
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-foreground">Profile Information</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-600/30 border-2 border-primary/30 flex items-center justify-center text-3xl font-bold text-primary">
                    {profile.name?.charAt(0) || "U"}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-xs text-primary mt-1 cursor-pointer hover:underline">Change avatar</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={profile.name} onChange={(v: string) => setProfile(p => ({ ...p, name: v }))} placeholder="John Doe" />
                <Input label="Email Address" value={profile.email} onChange={(v: string) => setProfile(p => ({ ...p, email: v }))} type="email" placeholder="you@company.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell your team a bit about yourself..."
                  rows={3} className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timezone</label>
                  <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {["Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Australia/Sydney"].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Language</label>
                  <select value={profile.language} onChange={e => setProfile(p => ({ ...p, language: e.target.value }))}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all">
                    {[["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["ja", "Japanese"], ["zh", "Chinese"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-foreground">Security Settings</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                <div className="space-y-3">
                  {[
                    { label: "Current Password", key: "currentPassword" },
                    { label: "New Password", key: "newPassword" },
                    { label: "Confirm New Password", key: "confirmPassword" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"}
                          value={(security as any)[field.key]}
                          onChange={e => setSecurity(s => ({ ...s, [field.key]: e.target.value }))}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { toast.success("Password updated!"); setSecurity(s => ({ ...s, currentPassword: "", newPassword: "", confirmPassword: "" })); }}
                    disabled={!security.currentPassword || !security.newPassword || security.newPassword !== security.confirmPassword}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-all">
                    Update Password
                  </button>
                </div>
              </div>
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Protect your account with TOTP authenticator</p>
                  </div>
                  <Toggle value={security.twoFA} onChange={v => setSecurity(s => ({ ...s, twoFA: v }))} />
                </div>
                {security.twoFA && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 glass rounded-xl p-4 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-3">Scan this QR code with your authenticator app:</p>
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <div className="grid grid-cols-8 gap-0.5 p-2">
                        {Array.from({ length: 64 }, (_, i) => <div key={i} className={cn("w-3 h-3", Math.random() > 0.5 ? "bg-black" : "bg-white")} />)}
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Or enter code: <span className="text-primary font-mono">JBSWY3DPEHPK3PXP</span></p>
                  </motion.div>
                )}
              </div>
              <div className="border-t border-border/50 pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Active Sessions</h3>
                {[
                  { device: "Chrome on macOS", ip: "103.24.81.xx", location: "Chennai, India", current: true, time: "Now" },
                  { device: "Safari on iPhone", ip: "103.24.81.xx", location: "Chennai, India", current: false, time: "2h ago" },
                  { device: "Edge on Windows", ip: "52.14.xx.xx", location: "Mumbai, India", current: false, time: "3d ago" },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          {session.device}
                          {session.current && <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Current</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{session.location} · {session.ip} · {session.time}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button onClick={() => toast.success("Session revoked")} className="text-xs text-red-400 hover:underline">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-red-500/20 pt-6">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                <div className="glass rounded-xl p-4 border border-red-500/20">
                  <p className="text-sm font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button onClick={() => toast.error("Please contact support to delete your account.")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-foreground">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "deviceAlerts" as NotifKey, icon: <Smartphone className="w-4 h-4" />, title: "Device Alerts", desc: "Get notified when devices go offline, overheat, or encounter errors" },
                  { key: "modelComplete" as NotifKey, icon: <Check className="w-4 h-4" />, title: "Model Training Complete", desc: "Receive notifications when training jobs finish or fail" },
                  { key: "deploymentEvents" as NotifKey, icon: <Globe className="w-4 h-4" />, title: "Deployment Events", desc: "Be alerted on deployment success, failures, and auto-scaling events" },
                  { key: "securityAlerts" as NotifKey, icon: <Shield className="w-4 h-4" />, title: "Security Alerts", desc: "Critical notifications for suspicious login attempts and API key misuse" },
                  { key: "teamActivity" as NotifKey, icon: <User className="w-4 h-4" />, title: "Team Activity", desc: "Updates when teammates add devices, models, or modify settings" },
                  { key: "weeklyDigest" as NotifKey, icon: <Mail className="w-4 h-4" />, title: "Weekly Digest Email", desc: "A weekly summary of your fleet performance and activity" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">{item.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle value={notifs[item.key]} onChange={v => setNotifs(n => ({ ...n, [item.key]: v }))} />
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Mail className="w-4 h-4" />, label: "Email", value: profile.email, connected: true },
                    { icon: <Slack className="w-4 h-4" />, label: "Slack", value: "Connect Slack workspace", connected: false },
                    { icon: <Webhook className="w-4 h-4" />, label: "Webhook", value: "Add webhook URL", connected: false },
                  ].map((ch, i) => (
                    <div key={i} className="flex items-center justify-between glass rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">{ch.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{ch.label}</p>
                          <p className="text-xs text-muted-foreground">{ch.value}</p>
                        </div>
                      </div>
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", ch.connected ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-muted/50 text-muted-foreground border-border/50 cursor-pointer hover:border-primary/40 hover:text-primary")}
                        onClick={() => !ch.connected && toast.info(`Connect ${ch.label} channel`)}>
                        {ch.connected ? "Connected" : "Connect"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end"><button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Preferences"}
              </button></div>
            </div>
          )}

          {/* Appearance */}
          {tab === "appearance" && (
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-foreground">Appearance</h2>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "dark", label: "Dark", icon: <Moon className="w-5 h-5" />, preview: "bg-[#080c14]" },
                    { id: "light", label: "Light", icon: <Sun className="w-5 h-5" />, preview: "bg-gray-100" },
                    { id: "system", label: "System", icon: <Globe className="w-5 h-5" />, preview: "bg-gradient-to-br from-[#080c14] to-gray-100" },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={cn("p-4 rounded-xl border text-center transition-all", theme === t.id ? "border-primary/60 bg-primary/10" : "border-border/50 hover:border-border hover:bg-muted/30")}>
                      <div className={cn("w-full h-12 rounded-lg mb-3", t.preview)} />
                      <div className={cn("flex items-center justify-center gap-1.5 text-sm font-medium", theme === t.id ? "text-primary" : "text-muted-foreground")}>
                        {t.icon}{t.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {[
                    { id: "cyan", color: "bg-cyan-400", label: "Cyan" },
                    { id: "violet", color: "bg-violet-500", label: "Violet" },
                    { id: "green", color: "bg-green-400", label: "Green" },
                    { id: "orange", color: "bg-orange-400", label: "Orange" },
                    { id: "pink", color: "bg-pink-400", label: "Pink" },
                  ].map(c => (
                    <button key={c.id} onClick={() => setAccentColor(c.id)}
                      className={cn("w-10 h-10 rounded-full transition-all", c.color, accentColor === c.id ? "ring-2 ring-offset-2 ring-offset-background ring-white scale-110" : "opacity-60 hover:opacity-100")}
                      title={c.label} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Compact Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing for denser information display</p>
                </div>
                <Toggle value={compactMode} onChange={setCompactMode} />
              </div>
              <div className="flex justify-end"><button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Appearance"}
              </button></div>
            </div>
          )}

          {/* Advanced */}
          {tab === "advanced" && (
            <div className="p-6 space-y-6">
              <h2 className="font-bold text-foreground">Advanced Settings</h2>
              {[
                { title: "Data Retention", desc: "How long to keep sensor readings and logs", options: ["7 days", "30 days", "90 days", "1 year", "Forever"], value: "30 days" },
                { title: "API Rate Limit", desc: "Maximum API requests per minute per key", options: ["100/min", "500/min", "1000/min", "5000/min", "Unlimited"], value: "1000/min" },
                { title: "Export Format Default", desc: "Default format when exporting data", options: ["CSV", "JSON", "Parquet", "Excel"], value: "CSV" },
                { title: "Device Timeout", desc: "Mark device offline after being unreachable for", options: ["1 min", "5 min", "10 min", "30 min", "1 hour"], value: "10 min" },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{setting.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                  </div>
                  <select defaultValue={setting.value} className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all ml-4">
                    {setting.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex justify-end"><button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Settings"}
              </button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
