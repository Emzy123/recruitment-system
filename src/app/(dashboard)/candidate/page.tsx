"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function CandidateDashboardPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [appsRes, notifRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/notifications?unreadOnly=true")
      ]);

      if (!appsRes.ok || !notifRes.ok) {
        throw new Error("Failed to load data");
      }

      const [appsJson, notifJson] = await Promise.all([
        appsRes.json().catch(() => null),
        notifRes.json().catch(() => null)
      ]);

      setApps(appsJson?.items ?? []);
      setNotifications(notifJson?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!cancelled) {
      loadData();
    }
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

        {error ? (
          <ErrorMessage 
            message={error} 
            onRetry={loadData}
          />
        ) : loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-center h-12">
                  <LoadingSpinner size="md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-strong">Unread notifications</h2>
              <Link href="/candidate/applications" className="text-sm text-indigo-700 font-medium hover:underline">
                View
              </Link>
            </div>
            {loading ? (
              <div className="mt-4 flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No notifications"
                  description="You don't have any unread notifications at the moment."
                  icon={
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 5).map((n: any) => (
                  <Link
                    key={n._id}
                    href={n.link ?? "/candidate/applications"}
                    className="block rounded-xl border border-subtle surface-card p-3 hover:shadow-sm transition-shadow"
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
            {loading ? (
              <div className="mt-4 flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : apps.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No applications yet"
                  description="Start by browsing positions and submitting your first application."
                  action={{
                    label: "Browse positions",
                    onClick: () => window.location.href = "/positions"
                  }}
                  icon={
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {apps.slice(0, 5).map((a: any) => (
                  <Link
                    key={a._id}
                    href={`/candidate/applications/${a._id}`}
                    className="block rounded-xl border border-subtle surface-card p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="text-sm font-medium text-strong">{a.positionId?.title ?? "Position"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-muted">Status:</div>
                      <StatusBadge 
                        status={
                          a.status === 'submitted' ? 'active' :
                          a.status === 'assessment' ? 'pending' :
                          a.status === 'offer' ? 'completed' :
                          a.status === 'rejected' ? 'error' : 'pending'
                        }
                      >
                        {a.status}
                      </StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

