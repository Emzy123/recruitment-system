"use client";

import { useEffect, useState } from "react";

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [location, setLocation] = useState("");
  const [currentEmployer, setCurrentEmployer] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const p = d.profile;
        if (!p) return;
        setLocation(p.location ?? "");
        setCurrentEmployer(p.currentEmployer ?? "");
        setYearsOfExperience(p.yearsOfExperience ?? 0);
        setLinkedin(p.linkedin ?? "");
        setGithub(p.github ?? "");
        setResumeUrl(p.resumeUrl ?? "");
        setCoverLetter(p.coverLetter ?? "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        currentEmployer,
        yearsOfExperience,
        linkedin,
        github,
        resumeUrl,
        coverLetter,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Failed to save");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="min-h-screen surface-page p-6">
      <div className="max-w-3xl mx-auto border border-subtle rounded-2xl p-6 surface-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Candidate Profile</h1>
            <p className="mt-2 text-muted text-sm">
              This profile is used to prefill applications and can be updated anytime.
            </p>
          </div>
          <button
            onClick={save}
            className="btn-primary px-4 py-2 rounded-md text-sm"
            disabled={loading}
          >
            Save
          </button>
        </div>

        {loading ? <div className="mt-4 text-sm text-muted">Loading…</div> : null}
        {error ? (
          <div className="mt-4 rounded-lg bg-danger-subtle text-danger border border-subtle p-3 text-sm">{error}</div>
        ) : null}
        {saved ? (
          <div className="mt-4 rounded-lg bg-success-subtle text-success border border-subtle p-3 text-sm">
            Saved.
          </div>
        ) : null}

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="location">Location</label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input mt-1 rounded-md"
            />
          </div>
          <div>
            <label className="label" htmlFor="currentEmployer">Current employer</label>
            <input
              id="currentEmployer"
              value={currentEmployer}
              onChange={(e) => setCurrentEmployer(e.target.value)}
              className="input mt-1 rounded-md"
            />
          </div>
          <div>
            <label className="label" htmlFor="yearsOfExperience">Years of experience</label>
            <input
              id="yearsOfExperience"
              type="number"
              min={0}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              className="input mt-1 rounded-md"
            />
          </div>
          <div>
            <label className="label" htmlFor="resumeUrl">Resume URL</label>
            <input
              id="resumeUrl"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="input mt-1 rounded-md"
            />
          </div>
          <div>
            <label className="label" htmlFor="linkedin">LinkedIn</label>
            <input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="input mt-1 rounded-md"
            />
          </div>
          <div>
            <label className="label" htmlFor="github">GitHub</label>
            <input
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="input mt-1 rounded-md"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="coverLetter">Default cover letter</label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            className="input mt-1 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}

