"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Cpu, Brain, Rocket, BarChart3, Zap, Download,
  Plug, Settings, Bell, LogOut, Menu, X, CircuitBoard, ChevronDown,
  User, Key, Users, Webhook, Home, Shield, Terminal
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/devices", label: "Devices", icon: <Cpu className="w-4 h-4" /> },
  { href: "/ai-models", label: "AI Models", icon: <Brain className="w-4 h-4" /> },
  { href: "/deployments", label: "Deployments", icon: <Rocket className="w-4 h-4" /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/automations", label: "Automations", icon: <Zap className="w-4 h-4" /> },
  { href: "/export", label: "Export", icon: <Download className="w-4 h-4" /> },
  { href: "/integrations", label: "Integrations", icon: <Plug className="w-4 h-4" /> },
];

const settingsItems = [
  { href: "/settings", label: "General", icon: <Settings className="w-4 h-4" /> },
  { href: "/settings/api-keys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  { href: "/settings/team", label: "Team", icon: <Users className="w-4 h-4" /> },
  { href: "/settings/webhooks", label: "Webhooks", icon: <Webhook className="w-4 h-4" /> },
];

interface Notification { id: string; title: string; message: string; read: boolean; createdAt: string; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => {
      setNotifications(d.notifications || []);
      setUnread(d.unreadCount || 0);
    }).catch(() => {});
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markAllRead" }) });
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  }

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            <CircuitBoard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black text-sm leading-tight">
              <span className="gradient-text">Aether</span><span className="text-slate-300">Grid</span>
            </div>
            <div className="text-[9px] text-muted-foreground font-mono">EDGE AI PLATFORM</div>
          </div>
        </Link>
      </div>

      {/* Back to home */}
      <div className="px-3 pt-3">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/5 transition-all">
          <Home className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">Platform</div>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive(item.href) ? "bg-gradient-to-r from-cyan-500/20 to-violet-600/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_10px_rgba(0,212,255,0.08)]" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
            <span className={`transition-colors ${isActive(item.href) ? "text-cyan-400" : "text-muted-foreground group-hover:text-white"}`}>{item.icon}</span>
            {item.label}
            {isActive(item.href) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
          </Link>
        ))}

        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest px-3 mb-2 mt-5">Configuration</div>
        <button onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" /> Settings
          <ChevronDown className={`ml-auto w-3.5 h-3.5 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
        </button>
        {settingsOpen && (
          <div className="pl-4 space-y-0.5">
            {settingsItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(item.href) ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        )}

        <Link href="/docs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
          <Terminal className="w-4 h-4" /> Documentation
        </Link>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-border/20">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-600/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{session?.user?.name || "User"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
        </div>
        {profileOpen && (
          <div className="mt-1 space-y-0.5">
            <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
              <Shield className="w-3.5 h-3.5" /> Account Settings
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#060a14] text-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-border/20 flex-col bg-[#060a14]/80 backdrop-blur shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#060a14] border-r border-border/20 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border/20 flex items-center justify-between px-4 bg-[#060a14]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-muted/30" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Platform</span>
              <span>/</span>
              <span className="text-white font-medium capitalize">{pathname.split("/").filter(Boolean).pop()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all">
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0e1a] border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">Mark all read</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications</div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3.5 hover:bg-white/5 transition-colors ${!n.read ? "bg-cyan-500/5" : ""}`}>
                        <div className="flex items-start gap-2">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white mb-0.5">{n.title}</div>
                            <div className="text-[11px] text-muted-foreground leading-snug">{n.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="w-full py-2.5 text-[11px] text-muted-foreground hover:text-white border-t border-border/20 transition-colors">
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted/30 transition-all">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/40 to-violet-600/40 flex items-center justify-center text-[10px] font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0e1a] border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5">
                  <div className="px-4 py-3 border-b border-border/20 mb-1">
                    <div className="text-xs font-bold text-white truncate">{session?.user?.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</div>
                  </div>
                  <Link href="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </Link>
                  <Link href="/" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                    <Home className="w-3.5 h-3.5" /> Home Page
                  </Link>
                  <div className="border-t border-border/20 mt-1 pt-1">
                    <button onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Named export for pages that import { DashboardLayout }
export { DashboardLayout };
