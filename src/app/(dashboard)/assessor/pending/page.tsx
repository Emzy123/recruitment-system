"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AssessorPendingPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/assessments/invitations?status=submitted")
      .then((r) => r.json())
      .then((d) => setQueue(d.items ?? []))
      .catch(() => setQueue([]));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-strong">Pending reviews</h1>
          <p className="mt-1 text-muted">Submissions flagged for manual review or finalization.</p>
        </div>

        <div className="card p-5">
          <div className="space-y-2">
            {queue.length === 0 ? (
              <div className="text-sm text-muted">No submitted assessments waiting for finalization.</div>
            ) : null}
            {queue.map((q) => (
              <div
                key={q._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-subtle p-3 surface-card"
              >
                <div>
                  <div className="font-medium text-strong">{q?.assessmentId?.title ?? "Assessment"}</div>
                  <div className="text-sm text-muted">
                    {q?.candidateId?.firstName} {q?.candidateId?.lastName}
                  </div>
                </div>
                <Link href={`/assessor/invitations/${q._id}`} className="btn-secondary">
                  Finalize
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
