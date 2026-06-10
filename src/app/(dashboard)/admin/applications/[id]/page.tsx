"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_hire: "Strong Hire ✅",
  hire: "Hire ✅",
  consider: "Consider ⚠️",
  not_hire: "Not Hire ❌",
};

export default function AdminApplicationDecisionPage() {
  const params = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [interview, setInterview] = useState<any>(null);
  const [existingDecision, setExistingDecision] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApp();
    fetchReviews();
    fetchInterview();
  }, [params.id]);

  async function fetchApp() {
    const d = await fetch(`/api/applications/${params.id}`).then((r) => r.json()).catch(() => null);
    const application = d?.application ?? null;
    setApp(application);
    // If a final decision was already made, fetch it to display
    if (application) {
      const dr = await fetch(`/api/decisions/${params.id}`).then((r) => r.json()).catch(() => null);
      if (dr?.ok && dr?.decision) setExistingDecision(dr.decision);
    }
  }

  async function fetchReviews() {
    setLoadingReviews(true);
    const d = await fetch(`/api/reviews/${params.id}`).then((r) => r.json()).catch(() => null);
    setReviews(d?.items ?? []);
    setLoadingReviews(false);
  }

  async function fetchInterview() {
    const res = await fetch(`/api/interviews?applicationId=${params.id}`).then((r) => r.json()).catch(() => null);
    if (res?.ok && res?.items?.length > 0) {
      setInterview(res.items[0]);
    } else {
      setInterview(null);
    }
  }

  async function submitDecision(decision: "offer" | "reject" | "waitlist") {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const res = await fetch(`/api/decisions/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, notes }),
    });
    const json = await res.json().catch(() => null);
    setSubmitting(false);
    if (!res.ok) {
      setError(json?.error ?? "Failed to submit decision");
      return;
    }
    setSuccess(`Decision "${decision}" submitted successfully.`);
    fetchApp();
  }

  if (!app) return <div className="p-6 text-muted">Loading...</div>;

  const TERMINAL = ["offer", "rejected", "waitlist", "hired"];
  const isDecisionDone = TERMINAL.includes(app.status);
  const canDecide = app.status === "admin_decision";

  return (
    <div className="min-h-screen p-6 surface-page">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Application Header */}
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-strong">Final Hiring Decision</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
            <span>Status: <span className="font-semibold text-strong capitalize">{app.status?.replace(/_/g, " ")}</span></span>
            {app.candidateId?.firstName && (
              <span>Candidate: <span className="font-semibold text-strong">{app.candidateId.firstName} {app.candidateId.lastName}</span></span>
            )}
            {app.positionId?.title && (
              <span>Position: <span className="font-semibold text-strong">{app.positionId.title}</span></span>
            )}
          </div>
        </div>

        {/* Workflow Status Banner */}
        {isDecisionDone ? (
          <div className="card p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm">
            <div className="font-semibold text-base">
              {app.status === "offer" && "✅ Offer Extended"}
              {app.status === "waitlist" && "📋 Placed on Waitlist"}
              {app.status === "rejected" && "❌ Application Rejected"}
              {app.status === "hired" && "🎉 Candidate Hired"}
            </div>
            {existingDecision && (
              <div className="mt-2 space-y-1">
                <div>Decision: <strong className="capitalize">{existingDecision.decision}</strong></div>
                {existingDecision.notes && <div>Notes: {existingDecision.notes}</div>}
                {existingDecision.decisionDate && (
                  <div className="text-xs opacity-70">Made on: {new Date(existingDecision.decisionDate).toLocaleString()}</div>
                )}
              </div>
            )}
          </div>
        ) : !canDecide ? (
          <div className="card p-4 border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
            {app.status === "committee_review" ? (
              <>
                <div className="font-semibold">⏳ Awaiting Committee Review</div>
                <div className="mt-1">The committee has not submitted their peer review yet. You can make a final decision once the committee marks this as reviewed.</div>
              </>
            ) : app.status === "interview" ? (
              <>
                <div className="font-semibold">⏳ Candidate is in Interview Stage</div>
                <div className="mt-1">Once the scheduled panel interview evaluations are fully submitted, this application will advance to the decision phase.</div>
              </>
            ) : (
              <>
                <div className="font-semibold">⚠️ Application not in decision phase</div>
                <div className="mt-1">Current status is <strong>{app.status?.replace(/_/g, " ")}</strong>. Final decisions can only be made after committee review & interviews are complete.</div>
              </>
            )}
          </div>
        ) : null}

        {/* Committee Peer Reviews */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-strong mb-3">Committee Dossier Reviews</h2>
          {loadingReviews ? (
            <div className="text-sm text-muted">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-muted">No committee reviews submitted yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: any, i: number) => (
                <div key={r._id ?? i} className="border border-subtle rounded-lg p-4 surface-subtle text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-strong">
                      {r.reviewerId?.firstName ?? "—"} {r.reviewerId?.lastName ?? ""}
                    </span>
                    <span className="font-semibold">
                      {RECOMMENDATION_LABELS[r.recommendation] ?? r.recommendation}
                    </span>
                  </div>
                  {/* Scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted">
                    {["technicalSkill","problemSolving","communication","culturalFit","overall"].map(k => (
                      <div key={k} className="text-center border border-subtle rounded p-1">
                        <div className="capitalize">{k.replace(/([A-Z])/g," $1")}</div>
                        <div className="text-strong font-bold text-base">{r.scores?.[k] ?? "—"}/5</div>
                      </div>
                    ))}
                  </div>
                  {r.strengths && <div><span className="text-muted">Strengths: </span>{r.strengths}</div>}
                  {r.weaknesses && <div><span className="text-muted">Weaknesses: </span>{r.weaknesses}</div>}
                  {r.comments && <div><span className="text-muted">Comments: </span>{r.comments}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interview Panel Evaluations */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-strong mb-3">Interview Panel Evaluations</h2>
          {!interview ? (
            <div className="text-sm text-muted">No interview scheduled or conducted for this candidate.</div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm border border-subtle bg-gray-50 dark:bg-black/20 p-3 rounded-lg flex flex-wrap justify-between gap-3">
                <div>
                  <span className="text-muted block text-xs">Date & Time:</span>
                  <strong className="text-strong">{new Date(interview.scheduledAt).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-muted block text-xs">Location/Virtual Link:</span>
                  {interview.locationOrLink.startsWith("http") ? (
                    <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                      Link
                    </a>
                  ) : (
                    <strong className="text-strong">{interview.locationOrLink}</strong>
                  )}
                </div>
                <div>
                  <span className="text-muted block text-xs">Interview Status:</span>
                  <span className="capitalize font-semibold text-strong">{interview.status}</span>
                </div>
              </div>

              {(!interview.evaluations || interview.evaluations.length === 0) ? (
                <div className="text-sm text-muted">Interview scheduled but no panel evaluations have been submitted.</div>
              ) : (
                <div className="space-y-4">
                  {interview.evaluations.map((ev: any, idx: number) => (
                    <div key={idx} className="border border-subtle rounded-lg p-4 surface-subtle text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-strong">
                          {ev.interviewerId?.firstName ? `${ev.interviewerId.firstName} ${ev.interviewerId.lastName}` : "Panelist"}
                        </span>
                        <span className="font-semibold">
                          {RECOMMENDATION_LABELS[ev.recommendation] ?? ev.recommendation}
                        </span>
                      </div>
                      
                      {/* Rubrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-muted">
                        <div>
                          <div>Teaching/Research</div>
                          <strong className="text-strong text-base">{ev.scores?.teachingResearch}/5</strong>
                        </div>
                        <div>
                          <div>Academic Vision</div>
                          <strong className="text-strong text-base">{ev.scores?.academicVision}/5</strong>
                        </div>
                        <div>
                          <div>Domain Depth</div>
                          <strong className="text-strong text-base">{ev.scores?.domainDepth}/5</strong>
                        </div>
                        <div>
                          <div>Communication</div>
                          <strong className="text-strong text-base">{ev.scores?.communication}/5</strong>
                        </div>
                        <div>
                          <div>Cultural Fit</div>
                          <strong className="text-strong text-base">{ev.scores?.culturalFit}/5</strong>
                        </div>
                      </div>

                      {ev.strengths && <div><span className="text-muted text-xs">Strengths: </span>{ev.strengths}</div>}
                      {ev.weaknesses && <div><span className="text-muted text-xs">Weaknesses: </span>{ev.weaknesses}</div>}
                      {ev.comments && <div><span className="text-muted text-xs">Comments: </span>{ev.comments}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decision Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-strong mb-1">Make Final Decision</h2>
          {!canDecide && (
            <div className="text-xs text-muted mb-3">Decision buttons are disabled until committee review and interviews are complete.</div>
          )}

          <label className="label mt-2" htmlFor="notes">Decision Notes</label>
          <textarea
            id="notes"
            className="input mt-2 min-h-[120px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write final hiring rationale for the candidate record."
            disabled={!canDecide}
          />

          {error && <div className="mt-3 text-sm text-danger">{error}</div>}
          {success && <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{success}</div>}

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={() => submitDecision("offer")}
              disabled={!canDecide || submitting}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Offer"}
            </button>
            <button
              onClick={() => submitDecision("waitlist")}
              disabled={!canDecide || submitting}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Waitlist
            </button>
            <button
              onClick={() => submitDecision("reject")}
              disabled={!canDecide || submitting}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
