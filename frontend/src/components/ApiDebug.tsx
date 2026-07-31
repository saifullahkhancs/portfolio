import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export function ApiDebug() {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
        const json = await res.json().catch(() => null);
        setStatus({ http: res.status, ok: res.ok, body: json });
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };
    run();
    return () => controller.abort();
  }, []);

  // Only show in dev or when ?debug=1
  const show = typeof window !== "undefined" && (import.meta.env.DEV || window.location.search.includes("debug=1") || localStorage.getItem("debug") === "1");
  if (!show) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[9999] max-w-[380px] rounded-lg border border-amber-500/30 bg-zinc-950/90 p-3 font-mono text-[10px] text-zinc-200 backdrop-blur">
      <p className="font-bold text-amber-400">API Debug (dev)</p>
      <p className="mt-1 break-all">API_URL: {API_URL}</p>
      <p>Origin: {typeof window !== "undefined" ? window.location.origin : ""}</p>
      {error ? <p className="mt-1 text-red-400">error: {error}</p> : null}
      {status ? (
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[9px]">{JSON.stringify(status, null, 2)}</pre>
      ) : (
        <p className="mt-1">checking /api/health...</p>
      )}
      <p className="mt-2 text-[9px] text-zinc-500">Add ?debug=1 to URL to force show. Hide by removing param and clearing localStorage.debug</p>
    </div>
  );
}
