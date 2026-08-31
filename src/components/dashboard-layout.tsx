"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Cpu, Brain, Rocket, BarChart3, Zap, Download,
  Plug, Settings, Bell, LogOut, Menu, X, CircuitBoard, ChevronDown,
  User, Key, Users, Webhook, Home, Shield, Terminal, Radio,
  Search, Command
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/devices", label: "Devices", icon: <Cpu className="w-4 h-4" /> },
  { href: "/ai-models", label: "AI Models", icon: <Brain className="w-4 h-4" /> },
  { href: "/deployments", label: "Deployments", icon: <Rocket className="w-4 h-4" /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/automations", label: "Automations", icon: <Zap className="w-4 h-4" /> },
  { href: "/simulator", label: "Simulator", icon: <Radio className="w-4 h-4" />, badge: "NEW" },
  { href: "/export", label: "Export", icon: <Download className="w-4 h-4" /> },
  { href: "/integrations", label: "Integrations", icon: <Plug className="w-4 h-4" /> },
];

const settingsItems = [
  { href: "/settings", label: "General", icon: <Settings className="w-4 h-4" /> },
  { href: "/settings/api-keys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  { href: "/settings/team", label: "Team", icon: <Users className="w-4 h-4" /> },
  { href: "/settings/webhooks", label: "Webhooks", icon: <Webhook className="w-4 h-4" /> },
];

interface Notification { id: string; title: string; message: string; read: boolean; createdAt: string; type?: string; }

/* ── Command Palette ─────────────────────────────────────────── */
const ALL_COMMANDS = [
  { label: "Dashboard", href: "/dashboard", icon: "📊", group: "Navigation" },
  { label: "Devices", href: "/devices", icon: "🔌", group: "Navigation" },
  { label: "AI Models", href: "/ai-models", icon: "🧠", group: "Navigation" },
  { label: "Deployments", href: "/deployments", icon: "🚀", group: "Navigation" },
  { label: "Analytics", href: "/analytics", icon: "📈", group: "Navigation" },
  { label: "Automations", href: "/automations", icon: "⚡", group: "Navigation" },
  { label: "Simulator", href: "/simulator", icon: "📡", group: "Navigation" },
  { label: "Export Data", href: "/export", icon: "📤", group: "Navigation" },
  { label: "Integrations", href: "/integrations", icon: "🔗", group: "Navigation" },
  { label: "General Settings", href: "/settings", icon: "⚙️", group: "Settings" },
  { label: "API Keys", href: "/settings/api-keys", icon: "🔑", group: "Settings" },
  { label: "Team", href: "/settings/team", icon: "👥", group: "Settings" },
  { label: "Webhooks", href: "/settings/webhooks", icon: "🪝", group: "Settings" },
  { label: "Documentation", href: "/docs", icon: "📚", group: "Docs" },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();
  const filtered = ALL_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  );
  useEffect(() => { setIdx(0); }, [query]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setIdx(i => Math.min(i + 1, filtered.length - 1));
      if (e.key === "ArrowUp") setIdx(i => Math.max(i - 1, 0));
      if (e.key === "Enter" && filtered[idx]) { router.push(filtered[idx].href); onClose(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [filtered, idx, router, onClose]);

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0a0e1a] border border-border/50 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, settings…"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-muted-foreground focus:outline-none" />
          <kbd className="text-[10px] font-mono bg-muted/30 border border-border/40 px-1.5 py-0.5 rounded text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">No results for "{query}"</div>
          ) : groups.map(g => (
            <div key={g}>
              <div className="px-4 py-1.5 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">{g}</div>
              {filtered.filter(c => c.group === g).map((c, gi) => {
                const absI = filtered.indexOf(c);
                return (
                  <button key={c.href} onClick={() => { router.push(c.href); onClose(); }}
                    onMouseEnter={() => setIdx(absI)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${absI === idx ? "bg-cyan-500/15 text-cyan-400" : "text-muted-foreground hover:text-white"}`}>
                    <span className="text-base">{c.icon}</span>
                    <span className="font-medium">{c.label}</span>
                    <span className="ml-auto text-[10px] opacity-40">↵</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border/20 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-muted/30 border border-border/40 px-1 rounded">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-muted/30 border border-border/40 px-1 rounded">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-muted/30 border border-border/40 px-1 rounded">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Layout ─────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = useCallback(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => {
      setNotifications(d.notifications || []);
      setUnread(d.unreadCount || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [fetchNotifs]);

  // Global ⌘K shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(c => !c); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Auto-open settings if on settings path
  useEffect(() => {
    if (pathname.startsWith("/settings")) setSettingsOpen(true);
  }, [pathname]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const notifTypeColor = (type?: string) => {
    const m: Record<string, string> = {
      DEVICE_ALERT: "text-amber-400", MODEL_COMPLETE: "text-violet-400",
      DEPLOYMENT: "text-cyan-400", SECURITY: "text-green-400",
      SYSTEM: "text-emerald-400", TEAM: "text-purple-400",
    };
    return m[type || ""] || "text-cyan-400";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
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

      {/* ⌘K Search trigger */}
      <div className="px-3 pt-3">
        <button onClick={() => setCmdOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 border border-border/20 transition-all">
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Quick search…</span>
          <kbd className="text-[9px] font-mono bg-muted/20 border border-border/30 px-1.5 rounded">⌘K</kbd>
        </button>
      </div>

      <div className="px-3 pt-2">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/5 transition-all">
          <Home className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">Platform</div>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive(item.href)
              ? "bg-gradient-to-r from-cyan-500/20 to-violet-600/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_10px_rgba(0,212,255,0.08)]"
              : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
            <span className={`transition-colors ${isActive(item.href) ? "text-cyan-400" : "text-muted-foreground group-hover:text-white"}`}>{item.icon}</span>
            {item.label}
            {(item as any).badge && (
              <span className="ml-auto text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>
            )}
            {isActive(item.href) && !(item as any).badge && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
          </Link>
        ))}

        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest px-3 mb-2 mt-5">Configuration</div>
        <button onClick={() => setSettingsOpen(!settingsOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname.startsWith("/settings") ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
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

      {/* User footer */}
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
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}

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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border/20 flex items-center justify-between px-4 bg-[#060a14]/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-muted/30" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Platform</span><span>/</span>
              <span className="text-white font-medium capitalize">{pathname.split("/").filter(Boolean).pop() || "Dashboard"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ⌘K button visible on desktop */}
            <button onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/30 hover:border-cyan-400/30 px-2.5 py-1.5 rounded-lg transition-all">
              <Command className="w-3.5 h-3.5" /> <kbd className="font-mono">⌘K</kbd>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all">
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0e1a] border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      {unread > 0 && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
                    </div>
                    <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">Mark all read</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                        <p className="text-xs text-muted-foreground">All caught up!</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3.5 hover:bg-white/5 transition-colors ${!n.read ? "bg-cyan-500/5 border-l-2 border-cyan-400" : ""}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-cyan-400" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold mb-0.5 ${notifTypeColor(n.type)}`}>{n.title}</div>
                            <div className="text-[11px] text-muted-foreground leading-snug">{n.message}</div>
                            <div className="text-[10px] text-muted-foreground/50 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </div>
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

            {/* Profile dropdown */}
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
                  <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </Link>
                  <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all">
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

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export { DashboardLayout };
