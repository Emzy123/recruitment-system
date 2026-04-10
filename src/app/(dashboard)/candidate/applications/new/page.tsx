"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewApplicationPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [positionId, setPositionId] = useState("");

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [error, setError] = useState<string>("");
  const [submitBusy, setSubmitBusy] = useState(false);

  // Profile/app fields (persist to CandidateProfile on autosave + on final submit).
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [currentEmployer, setCurrentEmployer] = useState<string>("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [linkedin, setLinkedin] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [skills, setSkills] = useState<Array<{ name: string; proficiency: number }>>([]);
  const [education, setEducation] = useState<
    Array<{ degree: string; field: string; institution: string; graduationYear: number }>
  >([]);
  const [experience, setExperience] = useState<
    Array<{ title: string; company: string; startDate: string; endDate?: string; description: string }>
  >([]);

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [uploadBusy, setUploadBusy] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((d) => {
        setPositions(d.items ?? []);
        if (d.items?.[0]?._id) setPositionId(d.items[0]._id);
      });
  }, []);

  useEffect(() => {
    // Prefill from profile.
    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const p = d.profile;
        if (!p) return;
        setDateOfBirth(p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : "");
        setLocation(p.location ?? "");
        setCurrentEmployer(p.currentEmployer ?? "");
        setYearsOfExperience(p.yearsOfExperience ?? 0);
        setLinkedin(p.linkedin ?? "");
        setGithub(p.github ?? "");
        setResumeUrl(p.resumeUrl ?? "");
        setCoverLetter(p.coverLetter ?? "");
        setSkills(Array.isArray(p.skills) ? p.skills : []);
        setEducation(Array.isArray(p.education) ? p.education : []);
        setExperience(Array.isArray(p.experience) ? p.experience : []);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    // Autosave profile every 30 seconds.
    const id = setInterval(() => {
      const payload = buildProfilePayload();
      fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateOfBirth, location, currentEmployer, yearsOfExperience, linkedin, github, skills, education, experience, coverLetter, resumeUrl]);

  function buildProfilePayload() {
    return {
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      location,
      currentEmployer,
      yearsOfExperience,
      linkedin,
      github,
      resumeUrl,
      coverLetter,
      skills,
      education,
      experience: experience.map((e) => ({
        title: e.title,
        company: e.company,
        startDate: e.startDate ? new Date(e.startDate) : new Date(),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        description: e.description,
      })),
    };
  }

  function next() {
    setError("");
    setStep((s) => (s < 6 ? ((s + 1) as any) : s));
  }

  function prev() {
    setError("");
    setStep((s) => (s > 1 ? ((s - 1) as any) : s));
  }

  async function uploadResume(file: File) {
    setUploadBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Upload failed");
        return;
      }
      setResumeUrl(data.fileUrl);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitBusy(true);
    try {
      if (!positionId) {
        setError("Please select a position.");
        return;
      }
      if (!coverLetter.trim()) {
        setError("Cover letter is required.");
        return;
      }
      if (!resumeUrl) {
        setError("Resume upload is required.");
        return;
      }

      // Ensure profile is up-to-date before creating the application.
      await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProfilePayload()),
      });

      const res = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId, coverLetter, resumeUrl }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to submit");
        return;
      }
      router.push("/candidate/applications");
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="min-h-screen surface-page p-6">
      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto card border border-subtle rounded-xl p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">New Application</h1>
            <div className="text-sm text-muted mt-1">
              Step {step} of 6
            </div>
          </div>
          <div className="text-xs text-muted opacity-60">
            Autosaves every 30 seconds
          </div>
        </div>

        {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}

        {/* Step content */}
        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-strong">Position</label>
              <select
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="input mt-1 rounded-md"
              >
                {positions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-strong">Date of birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="input mt-1 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-strong">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="input mt-1 rounded-md"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-strong">Current employer</label>
                <input
                  value={currentEmployer}
                  onChange={(e) => setCurrentEmployer(e.target.value)}
                  placeholder="Company/Institution"
                  className="input mt-1 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-strong">Years of experience</label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="input mt-1 rounded-md"
                  min={0}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-strong">LinkedIn</label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="input mt-1 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-strong">GitHub</label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="input mt-1 rounded-md"
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-strong">Education</h2>
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() =>
                  setEducation((list) => [
                    ...list,
                    { degree: "", field: "", institution: "", graduationYear: 2026 },
                  ])
                }
              >
                Add
              </button>
            </div>

            {education.length === 0 ? (
              <div className="text-sm text-muted">Add your first education entry.</div>
            ) : null}

            {education.map((ed, idx) => (
              <div key={idx} className="border border-subtle rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-strong">Entry {idx + 1}</div>
                  <button
                    type="button"
                    className="text-sm text-danger hover:underline"
                    onClick={() => setEducation((l) => l.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={ed.degree}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEducation((l) => l.map((x, i) => (i === idx ? { ...x, degree: v } : x)));
                    }}
                    placeholder="Degree (e.g., PhD)"
                    className="input rounded-md"
                  />
                  <input
                    value={ed.field}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEducation((l) => l.map((x, i) => (i === idx ? { ...x, field: v } : x)));
                    }}
                    placeholder="Field"
                    className="input rounded-md"
                  />
                </div>
                <input
                  value={ed.institution}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEducation((l) => l.map((x, i) => (i === idx ? { ...x, institution: v } : x)));
                  }}
                  placeholder="Institution"
                  className="input rounded-md"
                />
                <input
                  type="number"
                  value={ed.graduationYear}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setEducation((l) => l.map((x, i) => (i === idx ? { ...x, graduationYear: v } : x)));
                  }}
                  placeholder="Graduation year"
                  className="input rounded-md"
                />
              </div>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-strong">Work Experience</h2>
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() =>
                  setExperience((list) => [
                    ...list,
                    { title: "", company: "", startDate: "", endDate: "", description: "" },
                  ])
                }
              >
                Add
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="text-sm text-muted">Add your first experience entry.</div>
            ) : null}

            {experience.map((ex, idx) => (
              <div key={idx} className="border border-subtle rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-strong">Entry {idx + 1}</div>
                  <button
                    type="button"
                    className="text-sm text-danger hover:underline"
                    onClick={() => setExperience((l) => l.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={ex.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperience((l) => l.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                    }}
                    placeholder="Title"
                    className="input rounded-md"
                  />
                  <input
                    value={ex.company}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperience((l) => l.map((x, i) => (i === idx ? { ...x, company: v } : x)));
                    }}
                    placeholder="Company/Institution"
                    className="input rounded-md"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={ex.startDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperience((l) => l.map((x, i) => (i === idx ? { ...x, startDate: v } : x)));
                    }}
                    className="input rounded-md"
                  />
                  <input
                    type="date"
                    value={ex.endDate ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setExperience((l) =>
                        l.map((x, i) => (i === idx ? { ...x, endDate: v } : x))
                      );
                    }}
                    className="input rounded-md"
                  />
                </div>
                <textarea
                  value={ex.description}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExperience((l) => l.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                  }}
                  rows={4}
                  placeholder="Description"
                  className="input rounded-md"
                />
              </div>
            ))}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-strong">Skills</h2>
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={() => setSkills((list) => [...list, { name: "", proficiency: 3 }])}
              >
                Add
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="text-sm text-muted">Add at least one skill.</div>
            ) : null}

            {skills.map((sk, idx) => (
              <div key={idx} className="border border-subtle rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-strong">Skill {idx + 1}</div>
                  <button
                    type="button"
                    className="text-sm text-danger hover:underline"
                    onClick={() => setSkills((l) => l.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={sk.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSkills((l) => l.map((x, i) => (i === idx ? { ...x, name: v } : x)));
                  }}
                  placeholder="Skill name (e.g., Algorithms)"
                  className="input rounded-md"
                />
                <div>
                  <label className="text-sm font-medium text-strong">Proficiency (1-5)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sk.proficiency}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSkills((l) => l.map((x, i) => (i === idx ? { ...x, proficiency: v } : x)));
                    }}
                    className="w-full"
                  />
                  <div className="text-xs text-muted">Current: {sk.proficiency}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-lg font-semibold text-strong">Resume & Cover Letter</h2>

            <div className="border border-subtle rounded-xl p-4 surface-subtle">
              <div className="text-sm text-strong font-medium">Resume upload</div>
              <div className="mt-2 text-sm text-muted">
                PDF/DOCX/images, max {Math.round((Number(process.env.MAX_FILE_SIZE ?? 5242880) / 1048576) * 10) / 10}MB.
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                className="mt-3 block w-full"
                disabled={uploadBusy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadResume(file);
                }}
              />
              {resumeUrl ? (
                <div className="mt-3 text-sm text-success">
                  Uploaded:{" "}
                  <a className="underline" href={resumeUrl} target="_blank" rel="noreferrer">
                    {resumeUrl}
                  </a>
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-strong">Cover letter</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="input mt-1 rounded-md"
              />
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="mt-5 space-y-4">
            <h2 className="text-lg font-semibold text-strong">Review & Submit</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-subtle rounded-xl p-4 surface-card">
                <div className="text-sm text-muted">Position</div>
                <div className="font-medium mt-1">
                  {positions.find((p) => p._id === positionId)?.title ?? positionId}
                </div>
              </div>
              <div className="border border-subtle rounded-xl p-4 surface-card">
                <div className="text-sm text-muted">Resume</div>
                <div className="font-medium mt-1">{resumeUrl ? "Uploaded" : "Missing"}</div>
              </div>
            </div>

            <div className="border border-subtle rounded-xl p-4 surface-card">
              <div className="text-sm text-muted">Cover letter</div>
              <div className="whitespace-pre-wrap mt-2 text-strong text-sm">
                {coverLetter.trim() ? coverLetter.trim().slice(0, 800) + (coverLetter.length > 800 ? "…" : "") : "—"}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitBusy}
              className="btn-primary w-full h-11 rounded-md font-medium"
            >
              {submitBusy ? "Submitting..." : "Submit application"}
            </button>
          </div>
        ) : null}

        {/* Navigation */}
        {step !== 6 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="btn-secondary px-4 py-2 rounded-md"
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="btn-primary px-4 py-2 rounded-md"
            >
              Continue
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}

