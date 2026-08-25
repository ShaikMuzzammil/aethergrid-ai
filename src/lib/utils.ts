import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function generateApiKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "ag_live_";
  const keyBody = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return prefix + keyBody;
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ONLINE: "text-green-400 bg-green-400/10",
    OFFLINE: "text-slate-400 bg-slate-400/10",
    WARNING: "text-yellow-400 bg-yellow-400/10",
    ERROR: "text-red-400 bg-red-400/10",
    MAINTENANCE: "text-blue-400 bg-blue-400/10",
    RUNNING: "text-green-400 bg-green-400/10",
    STOPPED: "text-slate-400 bg-slate-400/10",
    PENDING: "text-yellow-400 bg-yellow-400/10",
    FAILED: "text-red-400 bg-red-400/10",
    DEPLOYED: "text-green-400 bg-green-400/10",
    TRAINING: "text-blue-400 bg-blue-400/10",
    TRAINED: "text-cyan-400 bg-cyan-400/10",
    DRAFT: "text-slate-400 bg-slate-400/10",
  };
  return colors[status] || "text-slate-400 bg-slate-400/10";
}
