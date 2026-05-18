"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "Candidates" | "Committee" | "Assessors" | "Admins";

const stepsByRole: Record<Role, { title: string; description: string }[]> = {
  Candidates: [
    { title: "Browse & Apply", description: "Explore open positions and submit your application with a resume and cover letter." },
    { title: "Complete Assessments", description: "If selected, you'll receive an invitation to complete a timed, proctored assessment." },
    { title: "Track Progress", description: "View real-time updates on your application status directly from your dashboard." },
    { title: "Receive Offers", description: "Successful candidates receive formal offers and next steps through the portal." },
  ],
  Committee: [
    { title: "Review Pipeline", description: "Access a Kanban-style pipeline to track candidates through various stages." },
    { title: "Evaluate Assessments", description: "Review candidate assessment results, code submissions, and essay responses." },
    { title: "Score & Rubric", description: "Submit detailed rubric evaluations for candidates across technical and cultural dimensions." },
    { title: "Make Decisions", description: "Collaborate with other members to make final hiring recommendations." },
  ],
  Assessors: [
    { title: "Create Templates", description: "Design comprehensive assessment templates linked to specific open positions." },
    { title: "Add Questions", description: "Build question banks with coding challenges, MCQs, and essay prompts." },
    { title: "Review Submissions", description: "Manually review flagged assessment submissions and override scores if necessary." },
    { title: "Analyze Performance", description: "View analytics on question difficulty and candidate pass rates." },
  ],
  Admins: [
    { title: "Manage Positions", description: "Create, edit, and close job postings on the public portal." },
    { title: "User Management", description: "Control role-based access, assigning committee members and assessors." },
    { title: "System Configuration", description: "Adjust system-wide settings, application limits, and integration keys." },
    { title: "Audit Logs", description: "Monitor all system activity via comprehensive, searchable audit logs." },
  ],
};

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<Role>("Candidates");

  return (
    <div className="min-h-screen surface-page">
      <header className="border-b border-subtle surface-glass backdrop-blur">
        <div className="app-container py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:ring-4 ring-indigo-500/30">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              FR
            </div>
            <div>
              <div className="font-semibold">Faculty Recruitment System</div>
              <div className="text-sm text-muted">How it works</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/positions" className="text-muted hover:text-strong font-medium">
              Browse Positions
            </Link>
            <Link href="/login" className="btn-secondary px-3 py-2">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-strong tracking-tight">How it works</h1>
            <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
              A comprehensive workflow tailored for every participant in the recruitment process. Select your role to see how the system works for you.
            </p>
          </div>

          <div className="mt-12">
            <div className="flex overflow-x-auto pb-2 border-b border-subtle gap-2 sm:gap-6 justify-center">
              {(Object.keys(stepsByRole) as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                    activeRole === role
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-muted hover:text-strong hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {stepsByRole[activeRole].map((step, idx) => (
                <div key={idx} className="card p-6 surface-card border border-subtle hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-strong">{step.title}</h3>
                      <p className="mt-2 text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/register" className="btn-primary px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              Get Started Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
