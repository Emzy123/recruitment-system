"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CandidateDashboardPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/applications").then((r) => r.json().catch(() => null)),
      fetch("/api/notifications?unreadOnly=true").then((r) => r.json().catch(() => null)),
    ])
      .then(([appsJson, notifJson]) => {
        if (cancelled) return;
        setApps(appsJson?.items ?? []);
        setNotifications(notifJson?.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = apps.reduce(
    (acc: any, a: any) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-strong">Candidate Dashboard</h1>
              <p className="text-muted mt-2">
                Keep track of your applications, assessments, and committee decisions.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/positions" className="btn-primary">
                Browse positions
              </Link>
              <Link href="/candidate/applications/new" className="btn-secondary">
                New application
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-xs text-muted">Submitted</div>
            <div className="text-2xl font-semibold mt-1 text-strong">{counts.submitted ?? 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted">In assessment</div>
            <div className="text-2xl font-semibold mt-1 text-strong">{counts.assessment ?? 0}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted">Decisions</div>
            <div className="text-2xl font-semibold mt-1 text-strong">
              {(counts.offer ?? 0) + (counts.rejected ?? 0) + (counts.waitlist ?? 0)}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-strong">Unread notifications</h2>
              <Link href="/candidate/applications" className="text-sm text-indigo-700 font-medium hover:underline">
                View
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 text-sm text-muted">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="mt-4 text-sm text-muted">No unread notifications.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 5).map((n: any) => (
                  <Link
                    key={n._id}
                    href={n.link ?? "/candidate/applications"}
                    className="block rounded-xl border border-subtle surface-card p-3 hover:shadow-sm"
                  >
                    <div className="text-sm font-medium text-strong">{n.title}</div>
                    <div className="text-xs text-muted mt-1">{n.message}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-strong">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {apps.slice(0, 5).map((a: any) => (
                <Link
                  key={a._id}
                  href={`/candidate/applications/${a._id}`}
                  className="block rounded-xl border border-subtle surface-card p-3 hover:shadow-sm"
                >
                  <div className="text-sm font-medium text-strong">{a.positionId?.title ?? "Position"}</div>
                  <div className="text-xs text-muted mt-1">Status: {a.status}</div>
                </Link>
              ))}
              {apps.length === 0 ? (
                <div className="text-sm text-muted">You have no applications yet.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

