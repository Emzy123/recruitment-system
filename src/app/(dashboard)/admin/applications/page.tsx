"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto card p-6">
        <h1 className="text-2xl font-semibold text-strong">Application Decisions</h1>
        <p className="text-sm text-muted mt-2">
          Admin final decision board. Open any application to issue offer/reject/waitlist.
        </p>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {items.map((a) => (
            <Link key={a._id} href={`/admin/applications/${a._id}`} className="card p-4 hover:shadow-sm">
              <div className="font-medium text-strong">{a.positionId?.title ?? "Position"}</div>
              <div className="text-sm text-muted">Status: {a.status}</div>
            </Link>
          ))}
          {items.length === 0 ? (
            <div className="text-sm text-muted">No applications found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

