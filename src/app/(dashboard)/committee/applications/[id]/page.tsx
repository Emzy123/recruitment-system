"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CommitteeApplicationReviewPage() {
  const params = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState<
    "strong_hire" | "hire" | "consider" | "not_hire"
  >("hire");

  const [technicalSkill, setTechnicalSkill] = useState(3);
  const [problemSolving, setProblemSolving] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [culturalFit, setCulturalFit] = useState(3);
  const [overall, setOverall] = useState(3);

  useEffect(() => {
    setError(null);
    fetch(`/api/applications/${params.id}`)
      .then((r) => r.json())
      .then(async (d) => {
        const application = d.application ?? null;
        setApp(application);
        if (!application?._id) return;

        const invRes = await fetch(
          `/api/assessments/invitations?applicationId=${encodeURIComponent(application._id)}`
        );
        const invJson = await invRes.json().catch(() => null);
        const invite = invJson?.items?.[0];
        const assessmentId = invite?.assessmentId?._id ?? invite?.assessmentId;
        if (!assessmentId) return;

        const resultRes = await fetch(
          `/api/assessments/${assessmentId}/results?applicationId=${encodeURIComponent(application._id)}`
        );
        const resultJson = await resultRes.json().catch(() => null);
        if (resultRes.ok) setAssessmentResult(resultJson?.result ?? null);
      });
  }, [params.id]);

  async function submitReview() {
    setError(null);
    const res = await fetch(`/api/reviews/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores: { technicalSkill, problemSolving, communication, culturalFit, overall },
        strengths,
        weaknesses,
        comments,
        recommendation,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Failed to submit review");
      return;
    }
    setSuccess(true);
    const latest = await fetch(`/api/applications/${params.id}`).then((r) => r.json());
    setApp(latest.application ?? app);
  }

  if (!app) return <div className="p-6">Loading...</div>;

  const canReview = app.status === "committee_review";

  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-4xl mx-auto surface-card border border-subtle rounded-xl p-6">
        <h1 className="text-2xl font-semibold">Application Review</h1>
        <div className="mt-2 text-sm text-muted">Current status: <span className="font-semibold capitalize">{app.status?.replace(/_/g, " ")}</span></div>

        {/* Status guard banners */}
        {success && (
          <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 text-sm font-medium">
            ✅ Review submitted successfully. The application is now ready for admin final decision.
          </div>
        )}
        {!canReview && !success && (
          <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-3 text-sm">
            {app.status === "admin_decision" || ["offer","rejected","waitlist"].includes(app.status)
              ? "✅ Committee review already submitted. The admin will make the final decision."
              : `⏳ This application is not yet ready for committee review. Current status: ${app.status?.replace(/_/g, " ")}.`}
          </div>
        )}
        {error ? (
          <div className="mt-3 rounded-lg bg-danger-subtle text-danger border border-subtle p-3 text-sm">{error}</div>
        ) : null}

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 border border-subtle rounded-xl p-4 surface-card">
            <h2 className="font-semibold text-sm text-strong">Assessor technical report</h2>
            {assessmentResult ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="text-muted">
                  Auto score:{" "}
                  <span className="text-strong font-semibold">{assessmentResult.totalScore ?? "—"}</span>
                </div>
                <div className="text-muted">
                  Final score:{" "}
                  <span className="text-strong font-semibold">{assessmentResult.finalScore ?? "Not finalized"}</span>
                </div>
                <div className="text-muted">
                  Manual review:{" "}
                  <span className="text-strong font-semibold">{assessmentResult.manualReviewStatus ?? "pending"}</span>
                </div>
                <div className="text-muted">
                  Final report:
                  <div className="mt-1 text-strong whitespace-pre-wrap">
                    {assessmentResult.finalReport || "Assessor report not finalized yet."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted">No assessment report available yet.</div>
            )}
          </div>

          <div className="md:col-span-2 border border-subtle rounded-xl p-4 surface-subtle">
            <h2 className="font-semibold text-sm text-strong">Rubric scoring (1-5)</h2>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-sm text-muted">Technical skill: {technicalSkill}</div>
                <input type="range" min={1} max={5} value={technicalSkill} onChange={(e) => setTechnicalSkill(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="text-sm text-muted">Problem solving: {problemSolving}</div>
                <input type="range" min={1} max={5} value={problemSolving} onChange={(e) => setProblemSolving(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="text-sm text-muted">Communication: {communication}</div>
                <input type="range" min={1} max={5} value={communication} onChange={(e) => setCommunication(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="text-sm text-muted">Cultural fit: {culturalFit}</div>
                <input type="range" min={1} max={5} value={culturalFit} onChange={(e) => setCulturalFit(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="text-sm text-muted">Overall: {overall}</div>
                <input type="range" min={1} max={5} value={overall} onChange={(e) => setOverall(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>

          <div className="border border-subtle rounded-xl p-4 surface-card">
            <label className="text-sm font-medium text-strong">Strengths</label>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={4} className="mt-2 w-full input rounded-md" />
          </div>
          <div className="border border-subtle rounded-xl p-4 surface-card">
            <label className="text-sm font-medium text-strong">Weaknesses</label>
            <textarea value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={4} className="mt-2 w-full input rounded-md" />
          </div>

          <div className="md:col-span-2 border border-subtle rounded-xl p-4 surface-card">
            <label className="text-sm font-medium text-strong">Comments</label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} className="mt-2 w-full input rounded-md" disabled={!canReview} />
            <div className="mt-3">
              <label className="text-sm font-medium text-strong">Recommendation</label>
              <select value={recommendation} onChange={(e) => setRecommendation(e.target.value as any)} className="mt-2 w-full input rounded-md" disabled={!canReview}>
                <option value="strong_hire">Strong Hire</option>
                <option value="hire">Hire</option>
                <option value="consider">Consider</option>
                <option value="not_hire">Not Hire</option>
              </select>
            </div>

            <button onClick={submitReview} disabled={!canReview} className="mt-4 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {canReview ? "Submit Review" : "Review Already Submitted"}
            </button>
          </div>

          <div className="md:col-span-2 border border-subtle rounded-xl p-4 surface-subtle">
            <h2 className="font-semibold text-sm text-strong">Committee role</h2>
            <div className="mt-2 text-sm text-muted">
              Committee performs peer review only. Final hiring decision is made by Admin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

