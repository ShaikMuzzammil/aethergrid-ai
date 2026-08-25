"use client";
import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CircuitBoard, LayoutDashboard, Cpu, Brain, BarChart3, Zap, Settings,
  Network, Database, Bell, LogOut, Menu, X, ChevronDown, User, Sun, Moon,
  Rocket, Key, Webhook, Download, Users, Activity, Shield
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ]
  },
  {
    label: "Infrastructure",
    items: [
      { href: "/devices", icon: Cpu, label: "Devices" },
      { href: "/deployments", icon: Rocket, label: "Deployments" },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/ai-models", icon: Brain, label: "AI Models" },
      { href: "/automations", icon: Zap, label: "Automations" },
    ]
  },
  {
    label: "Data",
    items: [
      { href: "/export", icon: Download, label: "Export Center" },
      { href: "/integrations", icon: Network, label: "Integrations" },
    ]
  },
  {
    label: "Settings",
    items: [
      { href: "/settings", icon: Settings, label: "Settings" },
      { href: "/settings/api-keys", icon: Key, label: "API Keys" },
      { href: "/settings/webhooks", icon: Webhook, label: "Webhooks" },
      { href: "/settings/team", icon: Users, label: "Team" },
    ]
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card/50 border-r border-border/50 backdrop-blur-xl flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <CircuitBoard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">
              <span className="gradient-text">Aether</span>
              <span className="text-slate-300">Grid</span>
            </span>
          </Link>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navItems.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-2 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("nav-item", active && "active")}
                      onClick={() => setSidebarOpen(false)}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {/* User */}
        <div className="p-3 border-t border-border/50">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/30 border border-border flex items-center justify-center text-sm font-bold text-primary">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{session?.user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
            </button>
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" /> Profile
                </Link>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left">
                  {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <div className="border-t border-border my-1" />
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="status-dot status-online" />
            All systems operational
          </div>
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          {/* Theme toggle */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
