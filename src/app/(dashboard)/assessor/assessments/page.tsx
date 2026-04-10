"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AssessorAssessmentsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto card p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-strong">Assessment Templates</h1>
          <Link href="/assessor/assessments/create" className="btn-primary">
            Create template
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-sm text-muted">No templates yet.</div>
          ) : null}
          {items.map((a) => (
            <div
              key={a._id}
              className="border border-[color:var(--border)] rounded-lg p-3 surface-card"
            >
              <div className="font-medium text-strong">{a.title}</div>
              <div className="text-sm text-muted">
                {a.type} · {a.durationMinutes} min
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

