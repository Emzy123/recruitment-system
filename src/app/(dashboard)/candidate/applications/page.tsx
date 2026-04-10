"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CandidateApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-strong">My Applications</h1>
          <Link href="/candidate/applications/new" className="btn-primary">
            New Application
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((a: any) => (
            <Link
              key={a._id}
              href={`/candidate/applications/${a._id}`}
              className="card block p-4 hover:shadow-sm"
            >
              <div className="font-medium text-strong">{a.positionId?.title ?? "Position"}</div>
              <div className="text-sm text-muted">Status: {a.status}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

