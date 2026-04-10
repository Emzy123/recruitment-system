"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CandidateAssessmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/assessments/invitations")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-strong">Assessments</h1>
          <p className="mt-1 text-muted">Pending and completed assessments tied to your applications.</p>
        </div>

        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-6 text-sm text-muted">No assessment invitations yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((inv: any) => {
              const title = inv.assessmentId?.title ?? "Assessment";
              const status = inv.status ?? "pending";
              const aid =
                inv.assessmentId && typeof inv.assessmentId === "object"
                  ? inv.assessmentId._id
                  : inv.assessmentId;
              return (
                <Link
                  key={inv._id}
                  href={`/candidate/assessments/${aid}`}
                  className="card block p-4 hover:shadow-sm"
                >
                  <div className="font-medium text-strong">{title}</div>
                  <div className="text-sm text-muted capitalize">Status: {status}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
