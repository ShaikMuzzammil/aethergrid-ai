"use client";
import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@prisma/client";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } finally { setLoading(false); }
  }, []);

  const markAllRead = useCallback(async () => {
    await window.fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    setUnread(0);
    setNotifications(p => p.map(n => ({ ...n, read: true })));
  }, []);

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, [fetch]);
  return { notifications, unread, loading, refetch: fetch, markAllRead };
}
