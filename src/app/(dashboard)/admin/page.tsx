"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .catch(() => setError("Failed to load analytics"));
  }, []);

  async function downloadApplicationsReport() {
    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportType: "applications", format: "csv" }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-strong">Admin Dashboard</h1>
              <p className="text-muted mt-2">
                Manage users, positions, assessments, and monitor system activity.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/admin/users" className="btn-secondary">
                Users
              </Link>
              <Link href="/admin/applications" className="btn-secondary">
                Applications
              </Link>
              <Link href="/admin/positions" className="btn-secondary">
                Positions
              </Link>
              <Link href="/admin/assessments" className="btn-secondary">
                Assessments
              </Link>
              <Link href="/admin/audit-logs" className="btn-secondary">
                Audit logs
              </Link>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-danger-subtle border border-subtle rounded-xl p-4 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-xs text-muted">Total applications</div>
            <div className="text-2xl font-semibold mt-1 text-strong">
              {analytics?.totalApplications ?? "—"}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-muted">Assessment pass rate</div>
            <div className="text-2xl font-semibold mt-1 text-strong">
              {typeof analytics?.assessmentPassRate === "number"
                ? `${analytics.assessmentPassRate}%`
                : "—"}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-muted">Positions by department</div>
            <div className="text-2xl font-semibold mt-1 text-strong">
              {Array.isArray(analytics?.positionsByDepartment)
                ? analytics.positionsByDepartment.length
                : "—"}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-strong">Reports</h2>
            <button onClick={downloadApplicationsReport} className="btn-primary">
              Download applications CSV
            </button>
          </div>
          <div className="mt-3 text-sm text-muted">
            Exports a simple CSV via `POST /api/admin/reports`.
          </div>
        </div>
      </div>
    </div>
  );
}

