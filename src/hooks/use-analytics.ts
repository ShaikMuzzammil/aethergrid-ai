"use client";
import { useState, useEffect } from "react";

export function useAnalytics(type: string, range: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await window.fetch(`/api/analytics?type=${type}&range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        setData(await res.json());
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [type, range]);

  return { data, loading, error };
}
