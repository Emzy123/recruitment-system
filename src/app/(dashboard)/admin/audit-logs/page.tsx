"use client";
import { useEffect, useState } from "react";

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto card p-6">
        <h1 className="text-2xl font-semibold text-strong">Audit Logs</h1>
        <div className="mt-4 space-y-2">
          {items.map((i) => (
            <div key={i._id} className="border border-[color:var(--border)] rounded-lg p-3 text-sm surface-card">
              <div className="font-medium text-strong">{i.action}</div>
              <div className="text-muted">{i.entityType} / {i.entityId}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

