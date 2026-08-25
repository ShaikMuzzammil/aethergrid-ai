"use client";
import { useState, useEffect, useCallback } from "react";
import type { DeviceWithDetails } from "@/types";

export function useDevices(params?: { status?: string; type?: string; page?: number }) {
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.type) qs.set("type", params.type);
      if (params?.page) qs.set("page", String(params.page));
      const res = await window.fetch(`/api/devices?${qs}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDevices(data.devices || []);
      setTotal(data.total || 0);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [params?.status, params?.type, params?.page]);

  useEffect(() => { fetch(); }, [fetch]);
  return { devices, total, loading, error, refetch: fetch };
}
