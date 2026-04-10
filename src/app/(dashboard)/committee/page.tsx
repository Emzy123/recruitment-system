"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AppItem = any;

const STATUSES = [
  "submitted",
  "screening",
  "assessment",
  "review",
  "interview",
  "offer",
  "waitlist",
  "hired",
  "rejected",
] as const;

export default function CommitteeDashboardPage() {
  const [items, setItems] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/applications?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(d.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byStatus = useMemo(() => {
    const map: Record<string, AppItem[]> = {};
    for (const s of STATUSES) map[s] = [];
    for (const a of items) {
      const s = a.status ?? "submitted";
      (map[s] ?? (map[s] = [])).push(a);
    }
    return map;
  }, [items]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-strong">Committee Dashboard</h1>
              <p className="text-muted mt-2">
                Review applications, submit rubric evaluations, and make decisions.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/committee/applications" className="btn-primary">
                All applications
              </Link>
              <Link href="/committee/analytics" className="btn-secondary">
                Analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-strong">Pipeline</h2>
            <div className="text-sm text-muted">
              {loading ? "Loading…" : `${items.length} applications`}
            </div>
          </div>

          <div className="mt-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {STATUSES.map((status) => (
                <div key={status} className="rounded-xl border border-subtle surface-subtle p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-strong">{status}</div>
                    <div className="text-xs text-muted">{byStatus[status].length}</div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {byStatus[status].slice(0, 6).map((a) => (
                      <Link
                        key={a._id}
                        href={`/committee/applications/${a._id}`}
                        className="block rounded-lg border border-subtle surface-card p-2 hover:shadow-sm"
                      >
                        <div className="text-xs font-medium text-strong line-clamp-2">
                          {a.positionId?.title ?? "Position"}
                        </div>
                        <div className="text-[11px] text-muted mt-1">
                          {a.candidateId?.firstName
                            ? `${a.candidateId.firstName} ${a.candidateId.lastName}`
                            : "Candidate"}
                        </div>
                      </Link>
                    ))}
                    {byStatus[status].length === 0 ? (
                      <div className="text-xs text-muted">No items</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-xs text-muted">
            Tip: Click a card to review, score with the rubric, and submit a decision.
          </div>
        </div>
      </div>
    </div>
  );
}

