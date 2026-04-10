"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AssessorFinalizeInvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [finalReport, setFinalReport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const invRes = await fetch(`/api/assessments/invitations/${params.id}`);
      const invJson = await invRes.json().catch(() => null);
      if (!invRes.ok || cancelled) return;
      const inv = invJson?.invitation ?? null;
      setInvitation(inv);

      const assessmentId = inv?.assessmentId?._id ?? inv?.assessmentId;
      const applicationId = inv?.applicationId?._id ?? inv?.applicationId;
      if (!assessmentId || !applicationId) return;

      const resultRes = await fetch(
        `/api/assessments/${assessmentId}/results?applicationId=${encodeURIComponent(applicationId)}`
      );
      const resultJson = await resultRes.json().catch(() => null);
      if (!cancelled && resultRes.ok) {
        const r = resultJson?.result ?? null;
        setResult(r);
        setFinalScore(Number(r?.totalScore ?? 0));
      }
    })().catch(() => setError("Failed to load invitation details."));

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function finalize() {
    setError(null);
    setBusy(true);
    try {
      const assessmentId = invitation?.assessmentId?._id ?? invitation?.assessmentId;
      const applicationId = invitation?.applicationId?._id ?? invitation?.applicationId;
      const res = await fetch(`/api/assessments/${assessmentId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, finalScore, finalReport }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ?? "Failed to finalize assessment report.");
        return;
      }
      router.push("/assessor");
    } finally {
      setBusy(false);
    }
  }

  if (!invitation) return <div className="p-6 text-muted">Loading...</div>;

  return (
    <div className="min-h-screen p-6 surface-page">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-strong">Finalize Technical Assessment</h1>
          <div className="mt-2 text-sm text-muted">
            Candidate: {invitation?.candidateId?.firstName} {invitation?.candidateId?.lastName}
          </div>
          <div className="text-sm text-muted">
            Assessment: {invitation?.assessmentId?.title ?? invitation?.assessmentId}
          </div>
          <div className="text-sm text-muted">
            Application: {invitation?.applicationId?._id ?? invitation?.applicationId}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-strong">Auto-score output</h2>
          <div className="mt-2 text-sm text-muted">
            Total score: <span className="font-semibold text-strong">{result?.totalScore ?? "—"}</span>
          </div>
          <div className="mt-1 text-sm text-muted">
            Current pass state: {result?.passed ? "Passed" : "Not passed"}
          </div>
          <div className="mt-4 space-y-2">
            {(result?.answers ?? []).map((a: any) => (
              <div key={a.questionId} className="surface-subtle border border-subtle rounded-lg p-3">
                <div className="text-sm font-medium text-strong">Question score: {a.score}</div>
                <div className="text-xs text-muted mt-1">{a.feedback}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-strong">Assessor final report</h2>
          <label className="label mt-4" htmlFor="finalScore">
            Final score
          </label>
          <input
            id="finalScore"
            type="number"
            className="input mt-2"
            value={finalScore}
            onChange={(e) => setFinalScore(Number(e.target.value))}
            min={0}
          />

          <label className="label mt-4" htmlFor="finalReport">
            Final technical report
          </label>
          <textarea
            id="finalReport"
            className="input mt-2 min-h-[180px]"
            value={finalReport}
            onChange={(e) => setFinalReport(e.target.value)}
            placeholder="Summarize technical strengths, risks, and recommendation."
          />

          {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}

          <button
            type="button"
            onClick={finalize}
            disabled={busy || !finalReport.trim()}
            className="btn-primary mt-4"
          >
            {busy ? "Finalizing..." : "Finalize and move to committee"}
          </button>
        </div>
      </div>
    </div>
  );
}

