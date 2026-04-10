"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CommitteeApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-strong">Committee Applications</h1>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {items.map((a) => (
            <Link key={a._id} href={`/committee/applications/${a._id}`} className="card p-4 hover:shadow-sm">
              <div className="font-medium text-strong">{a.positionId?.title ?? "Position"}</div>
              <div className="text-sm text-muted">Status: {a.status}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

