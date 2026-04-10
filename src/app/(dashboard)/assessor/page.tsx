"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AssessorDashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    fetch("/api/assessments/invitations?status=submitted")
      .then((r) => r.json())
      .then((d) => setQueue(d.items ?? []))
      .catch(() => setQueue([]));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-strong">Assessor Dashboard</h1>
              <p className="text-muted mt-2">
                Manage assessment templates used for candidate evaluations.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/assessor/assessments/create" className="btn-primary">
                Create template
              </Link>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-strong">Manual review queue</h2>
            <span className="text-sm text-muted">{queue.length} pending</span>
          </div>
          <div className="mt-4 space-y-2">
            {queue.length === 0 ? (
              <div className="text-sm text-muted">No submitted assessments waiting for finalization.</div>
            ) : null}
            {queue.map((q) => {
              const candidate = q?.candidateId;
              const assessment = q?.assessmentId;
              const application = q?.applicationId;
              return (
                <div
                  key={q._id}
                  className="border border-[color:var(--border)] rounded-lg p-3 surface-card flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-strong">
                      {assessment?.title ?? "Assessment"}
                    </div>
                    <div className="text-sm text-muted">
                      {candidate?.firstName} {candidate?.lastName} · application{" "}
                      {application?._id ?? q.applicationId}
                    </div>
                  </div>
                  <Link href={`/assessor/invitations/${q._id}`} className="btn-secondary">
                    Finalize report
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-strong">Assessment templates</h2>
            <span className="text-sm text-muted">
              {items.length} template{items.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-muted">No templates yet. Create your first one.</div>
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
    </div>
  );
}

