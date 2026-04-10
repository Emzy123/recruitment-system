"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CandidateApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((r) => r.json())
      .then((d) => setItem(d.application ?? null));
  }, [params.id]);

  if (!item) return <div className="p-6">Loading...</div>;
  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-3xl mx-auto surface-card border border-subtle rounded-xl p-6">
        <h1 className="text-2xl font-semibold">Application</h1>
        <div className="mt-2 text-sm text-muted">Status: {item.status}</div>
        <div className="mt-4">
          <div className="font-medium text-strong">Cover letter</div>
          <p className="text-muted whitespace-pre-wrap">{item.coverLetter}</p>
        </div>
      </div>
    </div>
  );
}

