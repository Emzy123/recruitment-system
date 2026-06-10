"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CandidateApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((r) => r.json())
      .then((d) => setItem(d.application ?? null));

    fetch(`/api/interviews?applicationId=${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.items?.length > 0) {
          setInterview(d.items[0]);
        } else {
          setInterview(null);
        }
      })
      .catch(() => setInterview(null));
  }, [params.id]);

  if (!item) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Application details card */}
        <div className="surface-card border border-subtle rounded-xl p-6">
          <h1 className="text-2xl font-semibold">Application Details</h1>
          <div className="mt-2 text-sm text-muted">
            Status: <span className="font-semibold text-strong capitalize">{item.status?.replace(/_/g, " ")}</span>
          </div>
          {item.positionId?.title && (
            <div className="mt-1 text-sm text-muted">
              Position: <strong className="text-strong">{item.positionId.title}</strong>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="font-medium text-strong">Cover Letter</h2>
            <p className="text-muted mt-2 whitespace-pre-wrap text-sm border border-subtle rounded-lg p-4 bg-gray-50 dark:bg-black/10">
              {item.coverLetter || "No cover letter submitted."}
            </p>
          </div>
        </div>

        {/* Panel Interview card */}
        {interview && (
          <div className="surface-card border border-subtle rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle pb-2">
              <h2 className="text-lg font-semibold text-strong">Panel Interview</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                interview.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : interview.status === "cancelled"
                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
              }`}>
                {interview.status}
              </span>
            </div>

            {interview.status === "cancelled" ? (
              <p className="text-sm text-danger font-medium">This interview has been cancelled by the recruitment committee.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm surface-subtle p-4 rounded-xl border border-subtle">
                  <div>
                    <span className="text-muted block text-xs">Date & Time:</span>
                    <strong className="text-strong">{new Date(interview.scheduledAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Location / Virtual Meeting:</span>
                    {interview.locationOrLink.startsWith("http") ? (
                      <a
                        href={interview.locationOrLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Join Virtual Meeting
                      </a>
                    ) : (
                      <strong className="text-strong">{interview.locationOrLink}</strong>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted block text-xs">Interviewers Panel:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {interview.interviewers.map((intw: any) => (
                        <span key={intw._id} className="text-xs bg-white border border-subtle rounded-full px-3 py-1 font-medium text-strong">
                          👤 {intw.firstName} {intw.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {interview.notes && (
                  <div className="text-sm">
                    <span className="text-muted block text-xs">Candidate Instructions:</span>
                    <p className="text-strong mt-1 border border-subtle rounded-lg p-3 bg-white dark:bg-black/10">{interview.notes}</p>
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
