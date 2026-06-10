"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CommitteeApplicationReviewPage() {
  const params = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Dossier review states
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

  // Interview states
  const [interview, setInterview] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Schedule Form States
  const [scheduledAt, setScheduledAt] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [schedulingError, setSchedulingError] = useState<string | null>(null);
  const [schedulingBusy, setSchedulingBusy] = useState(false);

  // Interview Evaluation Form States
  const [intTeachingResearch, setIntTeachingResearch] = useState(3);
  const [intAcademicVision, setIntAcademicVision] = useState(3);
  const [intDomainDepth, setIntDomainDepth] = useState(3);
  const [intCommunication, setIntCommunication] = useState(3);
  const [intCulturalFit, setIntCulturalFit] = useState(3);
  const [intStrengths, setIntStrengths] = useState("");
  const [intWeaknesses, setIntWeaknesses] = useState("");
  const [intComments, setIntComments] = useState("");
  const [intRec, setIntRec] = useState<"strong_hire" | "hire" | "consider" | "not_hire">("hire");
  const [intEvalError, setIntEvalError] = useState<string | null>(null);
  const [intEvalBusy, setIntEvalBusy] = useState(false);
  const [intEvalSuccess, setIntEvalSuccess] = useState(false);

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

    fetchInterview();
    fetchStaff();

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d?.user ?? null))
      .catch(() => setCurrentUser(null));
  }, [params.id]);

  async function fetchInterview() {
    try {
      const res = await fetch(`/api/interviews?applicationId=${params.id}`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.items?.length > 0) {
        setInterview(data.items[0]);
      } else {
        setInterview(null);
      }
    } catch {
      setInterview(null);
    }
  }

  async function fetchStaff() {
    try {
      const res = await fetch("/api/users/staff");
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setStaff(data.items ?? []);
      }
    } catch {
      setStaff([]);
    }
  }

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

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setSchedulingError(null);
    setSchedulingBusy(true);

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: params.id,
          scheduledAt,
          locationOrLink,
          interviewers: selectedInterviewers,
          notes,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSchedulingError(data?.error ?? "Failed to schedule interview.");
        return;
      }

      await fetchInterview();
      const latest = await fetch(`/api/applications/${params.id}`).then((r) => r.json());
      setApp(latest.application ?? app);
    } catch (err: any) {
      setSchedulingError(err.message || "An error occurred.");
    } finally {
      setSchedulingBusy(false);
    }
  }

  async function handleEvaluate(e: React.FormEvent) {
    e.preventDefault();
    setIntEvalError(null);
    setIntEvalBusy(true);

    try {
      const res = await fetch(`/api/interviews/${interview._id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: {
            teachingResearch: intTeachingResearch,
            academicVision: intAcademicVision,
            domainDepth: intDomainDepth,
            communication: intCommunication,
            culturalFit: intCulturalFit,
          },
          strengths: intStrengths,
          weaknesses: intWeaknesses,
          comments: intComments,
          recommendation: intRec,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setIntEvalError(data?.error ?? "Failed to submit interview evaluation.");
        return;
      }

      setIntEvalSuccess(true);
      await fetchInterview();
      const latest = await fetch(`/api/applications/${params.id}`).then((r) => r.json());
      setApp(latest.application ?? app);
    } catch (err: any) {
      setIntEvalError(err.message || "An error occurred.");
    } finally {
      setIntEvalBusy(false);
    }
  }

  // Advance application state to admin decision manually (if needed)
  async function advanceToAdmin() {
    if (!confirm("Are you sure you want to transition this application to Admin Decision phase?")) return;
    try {
      const res = await fetch(`/api/applications/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "admin_decision" }),
      });
      if (res.ok) {
        const latest = await fetch(`/api/applications/${params.id}`).then((r) => r.json());
        setApp(latest.application ?? app);
      }
    } catch (err) {
      alert("Only administrator accounts can update application status directly.");
    }
  }

  if (!app) return <div className="p-6">Loading...</div>;

  const canReview = app.status === "committee_review";
  const showInterviewPanel = app.status === "interview" || !!interview;

  // Check if current user is an interviewer and has not evaluated yet
  const currentUserId = currentUser?.id ?? currentUser?.uid;
  const isAssignedInterviewer =
    interview?.interviewers?.some((intw: any) => intw._id === currentUserId || intw === currentUserId) ?? false;
  const hasEvaluated =
    interview?.evaluations?.some((evalDoc: any) => evalDoc.interviewerId === currentUserId || evalDoc.interviewerId?._id === currentUserId) ?? false;

  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header card */}
        <div className="surface-card border border-subtle rounded-xl p-6">
          <h1 className="text-2xl font-semibold">Application Review</h1>
          <div className="mt-2 text-sm text-muted">
            Current status: <span className="font-semibold capitalize text-strong">{app.status?.replace(/_/g, " ")}</span>
          </div>

          {/* Status guards */}
          {success && (
            <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 text-sm font-medium">
              ✅ Review submitted successfully. The application is now ready for next steps.
            </div>
          )}
          {!canReview && !success && (
            <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-3 text-sm">
              {app.status === "admin_decision" || ["offer", "rejected", "waitlist"].includes(app.status)
                ? "✅ Committee review already submitted. The admin will make the final decision."
                : `⏳ Current stage: ${app.status?.replace(/_/g, " ")}.`}
            </div>
          )}
          {error ? (
            <div className="mt-3 rounded-lg bg-danger-subtle text-danger border border-subtle p-3 text-sm">{error}</div>
          ) : null}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Assessor Technical Report */}
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

          {/* Dossier Rubric Scoring (1-5) */}
          <div className="md:col-span-2 border border-subtle rounded-xl p-4 surface-subtle">
            <h2 className="font-semibold text-sm text-strong">Dossier Rubric scoring (1-5)</h2>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-sm text-muted">Technical skill: {technicalSkill}</div>
                <input type="range" min={1} max={5} value={technicalSkill} onChange={(e) => setTechnicalSkill(Number(e.target.value))} className="w-full" disabled={!canReview} />
              </div>
              <div>
                <div className="text-sm text-muted">Problem solving: {problemSolving}</div>
                <input type="range" min={1} max={5} value={problemSolving} onChange={(e) => setProblemSolving(Number(e.target.value))} className="w-full" disabled={!canReview} />
              </div>
              <div>
                <div className="text-sm text-muted">Communication: {communication}</div>
                <input type="range" min={1} max={5} value={communication} onChange={(e) => setCommunication(Number(e.target.value))} className="w-full" disabled={!canReview} />
              </div>
              <div>
                <div className="text-sm text-muted">Cultural fit: {culturalFit}</div>
                <input type="range" min={1} max={5} value={culturalFit} onChange={(e) => setCulturalFit(Number(e.target.value))} className="w-full" disabled={!canReview} />
              </div>
              <div>
                <div className="text-sm text-muted">Overall: {overall}</div>
                <input type="range" min={1} max={5} value={overall} onChange={(e) => setOverall(Number(e.target.value))} className="w-full" disabled={!canReview} />
              </div>
            </div>
          </div>

          <div className="border border-subtle rounded-xl p-4 surface-card">
            <label className="text-sm font-medium text-strong">Strengths</label>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={4} className="mt-2 w-full input rounded-md" disabled={!canReview} />
          </div>
          <div className="border border-subtle rounded-xl p-4 surface-card">
            <label className="text-sm font-medium text-strong">Weaknesses</label>
            <textarea value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={4} className="mt-2 w-full input rounded-md" disabled={!canReview} />
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
              {canReview ? "Submit Dossier Review" : "Dossier Review Already Submitted"}
            </button>
          </div>
        </div>

        {/* Panel Interview scheduling & evaluation */}
        {showInterviewPanel && (
          <div className="card p-6 border border-subtle surface-card space-y-6">
            <div className="flex items-center justify-between border-b border-subtle pb-2">
              <h2 className="text-lg font-semibold text-strong">3. Panel Interview</h2>
              {interview && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  interview.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : interview.status === "cancelled"
                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                }`}>
                  {interview.status}
                </span>
              )}
            </div>

            {/* If no interview scheduled */}
            {!interview ? (
              <form onSubmit={handleSchedule} className="space-y-4">
                <p className="text-sm text-muted">Schedule a structured panel interview for this candidate.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="scheduledAt">Interview Date & Time</label>
                    <input
                      id="scheduledAt"
                      type="datetime-local"
                      className="input mt-1 w-full rounded-md"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="location">Virtual Meeting Link or Location</label>
                    <input
                      id="location"
                      type="text"
                      className="input mt-1 w-full rounded-md"
                      placeholder="e.g. Google Meet, Zoom URL, or Office Room"
                      value={locationOrLink}
                      onChange={(e) => setLocationOrLink(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Select Panel Interviewers (Committee/Admins)</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto border border-subtle p-3 rounded-lg bg-white mt-1">
                    {staff.length === 0 && <p className="text-xs text-muted">No staff available.</p>}
                    {staff.map((s) => (
                      <label key={s._id} className="flex items-center gap-2 text-sm text-strong cursor-pointer py-1 border-b border-gray-50 last:border-0">
                        <input
                          type="checkbox"
                          checked={selectedInterviewers.includes(s._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInterviewers([...selectedInterviewers, s._id]);
                            } else {
                              setSelectedInterviewers(selectedInterviewers.filter((id) => id !== s._id));
                            }
                          }}
                        />
                        <span>
                          {s.firstName} {s.lastName} <span className="text-xs text-muted capitalize">({s.role})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="notes">Notes / Instructions</label>
                  <textarea
                    id="notes"
                    className="input mt-1 w-full rounded-md"
                    placeholder="Provide meeting agenda or instruction details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {schedulingError && <div className="text-sm text-red-500">{schedulingError}</div>}

                <button
                  type="submit"
                  disabled={schedulingBusy || selectedInterviewers.length === 0}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {schedulingBusy ? "Scheduling..." : "Schedule Interview"}
                </button>
              </form>
            ) : (
              // If interview scheduled
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm surface-subtle p-4 rounded-xl border border-subtle">
                  <div>
                    <span className="text-muted block">Scheduled At:</span>
                    <strong className="text-strong">{new Date(interview.scheduledAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Location / Virtual Meeting:</span>
                    {interview.locationOrLink.startsWith("http") ? (
                      <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Launch Meeting Link
                      </a>
                    ) : (
                      <strong className="text-strong">{interview.locationOrLink}</strong>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted block">Interviewers Panel:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {interview.interviewers.map((intw: any) => (
                        <span key={intw._id} className="text-xs border border-subtle bg-white rounded-full px-3 py-1 font-medium text-strong">
                          👤 {intw.firstName} {intw.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                  {interview.notes && (
                    <div className="md:col-span-2">
                      <span className="text-muted block">Agenda/Notes:</span>
                      <p className="text-strong mt-0.5">{interview.notes}</p>
                    </div>
                  )}
                </div>

                {/* Submited evaluations list */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-strong">Panelist Evaluations ({interview.evaluations?.length ?? 0} submitted)</h3>
                  {(!interview.evaluations || interview.evaluations.length === 0) ? (
                    <p className="text-xs text-muted">Awaiting panel evaluations.</p>
                  ) : (
                    <div className="space-y-3">
                      {interview.evaluations.map((ev: any, idx: number) => {
                        const scoreSum = ev.scores.teachingResearch + ev.scores.academicVision + ev.scores.domainDepth + ev.scores.communication + ev.scores.culturalFit;
                        const scoreAvg = (scoreSum / 5).toFixed(1);
                        return (
                          <div key={idx} className="border border-subtle rounded-lg p-3 bg-white space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-strong">
                                {ev.interviewerId?.firstName ? `${ev.interviewerId.firstName} ${ev.interviewerId.lastName}` : "Panelist"}
                              </span>
                              <span className="font-bold bg-blue-50 px-2 py-0.5 border border-blue-200 text-blue-700 rounded capitalize">
                                {ev.recommendation?.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] text-muted py-1 bg-gray-50 rounded">
                              <div>Teaching: <strong>{ev.scores.teachingResearch}</strong></div>
                              <div>Vision: <strong>{ev.scores.academicVision}</strong></div>
                              <div>Depth: <strong>{ev.scores.domainDepth}</strong></div>
                              <div>Comm: <strong>{ev.scores.communication}</strong></div>
                              <div>Fit: <strong>{ev.scores.culturalFit}</strong></div>
                            </div>
                            {ev.strengths && <div><strong>Strengths:</strong> {ev.strengths}</div>}
                            {ev.weaknesses && <div><strong>Weaknesses:</strong> {ev.weaknesses}</div>}
                            {ev.comments && <div><strong>Remarks:</strong> {ev.comments}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Panelist Evaluation Form (if assigned and hasn't evaluated yet) */}
                {isAssignedInterviewer && !hasEvaluated && !intEvalSuccess && (
                  <form onSubmit={handleEvaluate} className="space-y-4 border-t border-subtle pt-6">
                    <h3 className="font-semibold text-strong">Submit Interview Panelist Evaluation</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 surface-subtle p-4 rounded-xl border border-subtle">
                      <div className="space-y-3 md:col-span-2">
                        <div>
                          <div className="text-xs text-muted">Teaching & Research Potential (1-5): {intTeachingResearch}</div>
                          <input type="range" min={1} max={5} value={intTeachingResearch} onChange={(e) => setIntTeachingResearch(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-muted">Academic Alignment & Vision (1-5): {intAcademicVision}</div>
                          <input type="range" min={1} max={5} value={intAcademicVision} onChange={(e) => setIntAcademicVision(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-muted">Problem Solving & Domain Depth (1-5): {intDomainDepth}</div>
                          <input type="range" min={1} max={5} value={intDomainDepth} onChange={(e) => setIntDomainDepth(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-muted">Communication & Presentation (1-5): {intCommunication}</div>
                          <input type="range" min={1} max={5} value={intCommunication} onChange={(e) => setIntCommunication(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-muted">Cultural Fit & Collaboration (1-5): {intCulturalFit}</div>
                          <input type="range" min={1} max={5} value={intCulturalFit} onChange={(e) => setIntCulturalFit(Number(e.target.value))} className="w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Strengths</label>
                        <textarea value={intStrengths} onChange={(e) => setIntStrengths(e.target.value)} rows={3} className="input mt-1 w-full rounded-md bg-white text-xs" required />
                      </div>
                      <div>
                        <label className="label">Weaknesses</label>
                        <textarea value={intWeaknesses} onChange={(e) => setIntWeaknesses(e.target.value)} rows={3} className="input mt-1 w-full rounded-md bg-white text-xs" required />
                      </div>
                    </div>

                    <div>
                      <label className="label">Remarks / Comments</label>
                      <textarea value={intComments} onChange={(e) => setIntComments(e.target.value)} rows={3} className="input mt-1 w-full rounded-md bg-white text-xs" />
                    </div>

                    <div>
                      <label className="label">Your Recommendation</label>
                      <select value={intRec} onChange={(e) => setIntRec(e.target.value as any)} className="input mt-1 w-full rounded-md bg-white text-xs">
                        <option value="strong_hire">Strong Hire</option>
                        <option value="hire">Hire</option>
                        <option value="consider">Consider</option>
                        <option value="not_hire">Not Hire</option>
                      </select>
                    </div>

                    {intEvalError && <div className="text-sm text-red-500">{intEvalError}</div>}

                    <button
                      type="submit"
                      disabled={intEvalBusy}
                      className="btn-primary w-full text-xs"
                    >
                      {intEvalBusy ? "Submitting Evaluation..." : "Submit Panel Evaluation"}
                    </button>
                  </form>
                )}

                {intEvalSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 text-xs font-semibold">
                    ✅ Your evaluation has been submitted.
                  </div>
                )}

                {/* If the interview is complete or panel has submitted, allow committee to push to admin_decision if they wish */}
                {app.status === "interview" && (
                  <div className="border-t border-subtle pt-4 flex justify-between items-center gap-3">
                    <p className="text-xs text-muted">Once interviews are complete, advance this candidate to final decision.</p>
                    <button
                      type="button"
                      onClick={advanceToAdmin}
                      className="btn-secondary text-xs"
                    >
                      Complete Interview Phase
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
