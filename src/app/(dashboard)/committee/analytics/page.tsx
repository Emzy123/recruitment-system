"use client";
import { useEffect, useState } from "react";

export default function CommitteeAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto card p-6">
        <h1 className="text-2xl font-semibold text-strong">Committee Analytics</h1>
        <p className="mt-2 text-sm text-muted">
          Shared recruitment metrics for committee decision support.
        </p>
        <pre className="mt-4 text-xs text-zinc-900 bg-zinc-100 p-3 rounded-lg overflow-auto border border-zinc-200">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}

