"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function CandidateAssessmentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const assessmentId = params.id;

  const [assessment, setAssessment] = useState<any>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applicationId, setApplicationId] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [timerEndAt, setTimerEndAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [submitBusy, setSubmitBusy] = useState(false);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);

  const submitted =
    searchParams.get("submitted") === "1" ||
    invitation?.status === "submitted" ||
    invitation?.status === "finalized";
  const questions: any[] = assessment?.questions ?? [];
  const activeQuestion = questions[activeQuestionIndex];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const assessmentRes = await fetch(`/api/assessments/${assessmentId}`);
        const assessmentJson = await assessmentRes.json().catch(() => null);
        if (cancelled) return;
        setAssessment(assessmentJson?.assessment ?? null);

        const invRes = await fetch(
          `/api/assessments/invitations?assessmentId=${encodeURIComponent(assessmentId)}`
        );
        const invJson = await invRes.json().catch(() => null);
        const invite = invJson?.items?.[0] ?? null;
        if (!cancelled) {
          setInvitation(invite);
          const appId = invite?.applicationId?._id ?? invite?.applicationId ?? "";
          if (appId) setApplicationId(appId);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ? String(e.message) : "Failed to load assessment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  useEffect(() => {
    if (!submitted || !applicationId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/assessments/${assessmentId}/results?applicationId=${encodeURIComponent(applicationId)}`
        );
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        setResult(json?.result ?? null);
      } catch {
        if (cancelled) return;
        setResult(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submitted, applicationId, assessmentId]);

  useEffect(() => {
    if (!started || timerEndAt == null) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [started, timerEndAt]);

  const durationMs = useMemo(() => {
    const mins = Number(assessment?.durationMinutes ?? 0);
    return mins > 0 ? mins * 60 * 1000 : 0;
  }, [assessment]);

  const remainingMs = timerEndAt == null ? null : Math.max(0, timerEndAt - now);
  const remainingLabel =
    remainingMs == null
      ? ""
      : `${Math.floor(remainingMs / 60000)}:${String(
          Math.floor((remainingMs % 60000) / 1000)
        ).padStart(2, "0")}`;

  function isAnswered(questionId: string) {
    const v = answers[questionId];
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "object") return Boolean(v.code || v.text || v.choice);
    return Boolean(v);
  }

  async function onStart() {
    setError(null);
    if (!applicationId) {
      setError("Could not find your application for this assessment.");
      return;
    }

    const res = await fetch(`/api/assessments/${assessmentId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });

    const raw = await res.text().catch(() => "");
    const data = raw ? (JSON.parse(raw) as any) : null;
    if (!res.ok) {
      setError(data?.error ?? `${res.status} ${res.statusText}${raw ? `: ${raw}` : ""}`);
      return;
    }
    setStarted(true);
    setTimerEndAt(Date.now() + durationMs);
  }

  async function onSubmit() {
    setError(null);
    setSubmitBusy(true);
    try {
      const confirmed = window.confirm("Submit your assessment now?");
      if (!confirmed) return;

      const payload = {
        applicationId,
        answers: (assessment?.questions ?? []).map((q: any) => {
          const qid = String(q._id);
          const entry = answers[qid] ?? {};
          const answer =
            q.type === "coding"
              ? entry.code ?? ""
              : q.type === "essay"
                ? entry.text ?? ""
                : entry.choice ?? "";
          return { questionId: qid, answer, timeSpent: 0 };
        }),
      };

      const res = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to submit");
        return;
      }

      window.location.href = `/candidate/assessments/${assessmentId}?submitted=1`;
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-6xl mx-auto">
        <div className="border border-subtle rounded-2xl p-5 shadow-sm surface-card">
          {loading ? (
            <div className="p-5 text-muted">Loading assessment...</div>
          ) : !assessment || !invitation ? (
            <div className="p-5 text-muted">Assessment not found.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-semibold">{assessment.title}</h1>
                  <p className="text-muted mt-2">{assessment.description}</p>
                  <div className="mt-2 text-sm text-muted">
                    Duration: {assessment.durationMinutes} minutes
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div
                    className={`rounded-xl border px-4 py-3 ${
                      remainingMs != null && remainingMs < 5 * 60 * 1000
                        ? "border-subtle bg-danger-subtle"
                        : "border-subtle surface-subtle"
                    }`}
                  >
                    <div className="text-xs text-muted">Timer</div>
                    <div className="text-xl font-semibold mt-1">
                      {started ? remainingLabel : "Not started"}
                    </div>
                    {started ? (
                      <div className="mt-1 text-xs text-muted">
                        {remainingMs === 0 ? "Time is up" : "In progress"}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-lg bg-danger-subtle text-danger border border-subtle p-3 text-sm">
                  {error}
                </div>
              ) : null}

              {submitted ? (
                <div className="mt-5 border border-subtle bg-success-subtle text-success rounded-xl p-4 text-sm">
                  Submission completed. (You can fetch results in the next UI iteration; backend already scores and marks pass/fail.)
                </div>
              ) : null}

              <div className="mt-5 grid lg:grid-cols-3 gap-4">
                <aside className="lg:col-span-1 border border-subtle rounded-xl p-3 surface-subtle">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm">Questions</div>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded-md border border-subtle surface-card disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={!started}
                      onClick={() => setActiveQuestionIndex(0)}
                    >
                      Jump to first
                    </button>
                  </div>
                  <div className="space-y-2">
                    {questions.map((q: any, idx: number) => {
                      const qid = String(q._id);
                      const answered = isAnswered(qid);
                      const flagged = flags[qid] ?? false;
                      return (
                        <button
                          key={qid}
                          type="button"
                          onClick={() => setActiveQuestionIndex(idx)}
                          disabled={!started && idx > 0}
                          className={`w-full text-left rounded-lg border px-3 py-2 ${
                            idx === activeQuestionIndex
                              ? "border-strong surface-card"
                              : answered
                                ? "border-subtle bg-success-subtle"
                                : "border-subtle surface-card"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              {idx + 1}. {q.title}
                            </div>
                            {flagged ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                Flag
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-muted mt-1">
                            {answered ? "Answered" : "Unanswered"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="lg:col-span-2 border border-subtle rounded-xl surface-card p-4">
                  {!activeQuestion ? (
                    <div className="text-muted">No active question.</div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-xs text-muted">
                            Question {activeQuestionIndex + 1} of {questions.length}
                          </div>
                          <div className="text-lg font-semibold mt-1">
                            {activeQuestion.title}
                          </div>
                          <div className="text-sm text-muted mt-1">
                            {activeQuestion.description}
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            className="px-3 py-2 rounded-md border border-subtle text-sm surface-card disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={!started}
                            onClick={() => {
                              const qid = String(activeQuestion._id);
                              setFlags((f) => ({ ...f, [qid]: !(f[qid] ?? false) }));
                            }}
                          >
                            {(flags[String(activeQuestion._id)] ?? false) ? "Unflag" : "Flag"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        {activeQuestion.type === "coding" ? (
                          <>
                            <div className="text-sm text-muted mb-2">
                              Coding ({activeQuestion.programmingLanguage})
                            </div>
                            <textarea
                              value={answers[String(activeQuestion._id)]?.code ?? activeQuestion.starterCode ?? ""}
                              onChange={(e) => {
                                const qid = String(activeQuestion._id);
                                setAnswers((a) => ({ ...a, [qid]: { code: e.target.value } }));
                              }}
                              disabled={!started}
                              className="w-full min-h-[260px] input rounded-md font-mono text-sm"
                              placeholder="Write your solution..."
                            />

                            {Array.isArray(activeQuestion.testCases) && activeQuestion.testCases.length ? (
                              <div className="mt-4 border-t pt-4">
                                <div className="text-sm font-semibold">Test cases (preview)</div>
                                <div className="mt-2 space-y-3">
                                  {activeQuestion.testCases.slice(0, 5).map((tc: any, idx: number) => (
                                    <div key={idx} className="rounded-md surface-subtle p-3 border border-subtle">
                                      <div className="text-xs text-muted">Input</div>
                                      <pre className="text-xs whitespace-pre-wrap mt-1">{tc.input}</pre>
                                      <div className="text-xs text-muted mt-2">Expected</div>
                                      <pre className="text-xs whitespace-pre-wrap mt-1">{tc.expectedOutput}</pre>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </>
                        ) : null}

                        {activeQuestion.type === "multiple_choice" ? (
                          <div className="space-y-2">
                            <div className="text-sm text-muted mb-2">Choose one option</div>
                            {(activeQuestion.options ?? []).map((opt: string, idx: number) => {
                              const qid = String(activeQuestion._id);
                              const current = answers[qid]?.choice ?? "";
                              return (
                                <label
                                  key={idx}
                                  className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`q-${qid}`}
                                    checked={current === opt}
                                    onChange={() => setAnswers((a) => ({ ...a, [qid]: { choice: opt } }))}
                                    disabled={!started}
                                  />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : null}

                        {activeQuestion.type === "essay" ? (
                          <div>
                            <textarea
                              value={answers[String(activeQuestion._id)]?.text ?? ""}
                              onChange={(e) => {
                                const qid = String(activeQuestion._id);
                                setAnswers((a) => ({ ...a, [qid]: { text: e.target.value } }));
                              }}
                              disabled={!started}
                              className="w-full min-h-[260px] input rounded-md text-sm"
                              placeholder="Write your answer..."
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-xs text-muted opacity-60">
                          Use the left panel to navigate questions.
                        </div>
                        <div className="flex items-center gap-2">
                          {!started ? (
                            <button
                              type="button"
                              className="px-4 py-2 rounded-md btn-primary text-sm"
                              onClick={onStart}
                            >
                              Start assessment
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={submitBusy || remainingMs === 0}
                              onClick={onSubmit}
                              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:cursor-not-allowed disabled:opacity-80"
                            >
                              {submitBusy ? "Submitting..." : "Submit"}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </div>

              {submitted ? (
                <section className="mt-6 border border-subtle rounded-2xl surface-card p-4">
                  <h2 className="text-lg font-semibold">Assessment results</h2>
                  {result ? (
                    <>
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-sm">
                          Total score: <span className="font-semibold">{result.totalScore}</span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm ${
                            result.passed
                              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                              : "bg-rose-50 text-rose-900 border border-rose-200"
                          }`}
                        >
                          {result.passed ? "Passed" : "Not passed"}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {(result.answers ?? []).map((a: any) => (
                          <div key={a.questionId} className="border border-subtle rounded-xl p-3 surface-subtle">
                            <div className="text-sm font-medium">
                              Question score: <span className="font-semibold">{a.score}</span>
                            </div>
                            <div className="text-xs text-muted mt-1">
                              Feedback: {a.feedback || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 text-sm text-muted">Loading results...</div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

