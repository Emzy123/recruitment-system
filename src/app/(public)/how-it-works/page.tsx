"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "Candidates" | "Committee" | "Assessors" | "Admins";

type Stage = {
  id: number;
  title: string;
  subtitle: string;
  actor: string;
  description: string;
  badge: string;
  details: string[];
};

const stages: Stage[] = [
  {
    id: 1,
    title: "Job Posting",
    subtitle: "Admin establishes open position details",
    actor: "Admins",
    description: "Admins or hiring managers define position parameters, required skills, preferred qualifications, and set live closing dates.",
    badge: "Setup",
    details: [
      "Dynamic skill tag generation",
      "Salary and location custom mapping",
      "Immediate public listing updates"
    ]
  },
  {
    id: 2,
    title: "Application",
    subtitle: "Candidate submits profile and files",
    actor: "Candidates",
    description: "Candidates fill a clean, multi-step application specifying education, work history, skills, cover letter, and resume files. A built-in 'Back' button allows effortless error correction before final submission.",
    badge: "Apply",
    details: [
      "Autosaves draft every 30 seconds",
      "Flexible step-by-step navigation",
      "Real-time upload verification"
    ]
  },
  {
    id: 3,
    title: "Technical Assessment",
    subtitle: "System manages proctored assessments",
    actor: "System & Assessors",
    description: "Candidates receive secure invitation links to complete custom, timed technical coding challenges, MCQs, or essay prompts.",
    badge: "Assess",
    details: [
      "Auto-timed proctored compiler environment",
      "Automatic question difficulty indexing",
      "Instant syntax and execution checks"
    ]
  },
  {
    id: 4,
    title: "Grading & Review",
    subtitle: "Assessors analyze results & adjust scores",
    actor: "Assessors",
    description: "Assessors review candidate submissions, read essay responses, examine execution outputs, and apply manual grading overrides where necessary.",
    badge: "Grade",
    details: [
      "Interactive code output viewer",
      "Automatic and manual rubric scoring",
      "Detailed question performance statistics"
    ]
  },
  {
    id: 5,
    title: "Committee Evaluation",
    subtitle: "Committee reviews applicants in pipeline",
    actor: "Committee",
    description: "Search Committee members access a collaborative Kanban pipeline, reviewing assessment summaries, resumes, and applying shared assessment rubrics.",
    badge: "Evaluate",
    details: [
      "Kanban-style drag-and-drop workflow tracking",
      "Shared double-blind grading sheets",
      "Real-time evaluation discussion log"
    ]
  },
  {
    id: 6,
    title: "Hiring Decision",
    subtitle: "Unanimous committee choice and offer",
    actor: "Committee & Admins",
    description: "The hiring panel checks final ranked scores, reaches consensus, and generates official recommendation reports to dispatch formal contract offers.",
    badge: "Approve",
    details: [
      "Weighted average score ranking board",
      "Hiring recommendation PDF dispatch",
      "Complete secure action logs"
    ]
  }
];

const stepsByRole: Record<Role, { title: string; description: string; icon: React.ReactNode }[]> = {
  Candidates: [
    {
      title: "Browse & Apply",
      description: "Explore all open roles and easily apply with our fluid, state-preserving, multi-step application form.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "Assessments",
      description: "Take structured programming, multiple-choice, or written assessments in a clean, proctored environment.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Track Status",
      description: "Follow your application from receipt, through assessment grading, to final committee evaluation in real-time.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ],
  Committee: [
    {
      title: "Collaborative Pipeline",
      description: "Monitor candidate applications in an intuitive visual board. Organize by review, interview, or recommendation stages.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Assessment Review",
      description: "Examine student grading summaries, compile runtimes, test suite completion metrics, and written essay answers.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: "Rubric Grading",
      description: "Deliver detailed dimensions of cultural and academic ratings using unified, standardized scoring rubrics.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ],
  Assessors: [
    {
      title: "Assessment Architect",
      description: "Generate position-specific assessment configurations containing automated coding playgrounds and custom MCQ banks.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      title: "Evaluation Dashboard",
      description: "Audit automated scoring and code runtimes. Submit scores for custom essay answers in a dedicated reviewer pane.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
  ],
  Admins: [
    {
      title: "Position Management",
      description: "Quickly post new positions, customize required skill tags, and audit applications directly.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Security Rules & Audits",
      description: "Assign user roles (Admin, Committee, Assessor), establish permissions, and inspect system audit trails.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ]
};

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [activeRole, setActiveRole] = useState<Role>("Candidates");

  const currentStage = stages[activeStage];

  return (
    <div className="min-h-screen surface-page flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl surface-glass">
        <div className="app-container py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 no-underline focus-visible:ring-4 ring-indigo-500/30">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-white text-sm"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                boxShadow: "0 4px 14px color-mix(in srgb, var(--brand) 35%, transparent)",
              }}
            >
              FR
            </div>
            <div>
              <div className="font-bold text-[15px]" style={{ color: "var(--foreground)" }}>
                FacultyRecruit
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                How It Works
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/positions"
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] no-underline"
              style={{ color: "var(--muted)" }}
            >
              Browse Roles
            </Link>
            <Link href="/login" className="btn-secondary px-4 py-2 text-xs font-semibold">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 py-16 app-container max-w-5xl">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
            style={{
              background: "color-mix(in srgb, var(--brand) 8%, transparent)",
              borderColor: "color-mix(in srgb, var(--brand) 20%, var(--border))",
              color: "var(--brand)",
            }}
          >
            SYSTEM ARCHITECTURE
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-strong tracking-tight mt-4">
            End-to-End Recruitment
          </h1>
          <p className="mt-4 text-muted text-base leading-relaxed">
            FacultyRecruit bridges the gap between eager candidates, technical reviewers, and final selection committees using secure, structured stages.
          </p>
        </div>

        {/* ── SECTION 1: INTERACTIVE LIFE-CYCLE TIMELINE ── */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-strong">
              Interactive Recruitment Flowchart
            </h2>
            <p className="text-sm text-muted mt-1">
              Select any stage below to inspect active tasks and system data flow
            </p>
          </div>

          {/* Flowchart Node Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8 relative">
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-[28px] left-[8%] right-[8%] h-0.5 bg-border -z-10"
                 style={{ background: "linear-gradient(90deg, var(--border), color-mix(in srgb, var(--brand) 40%, var(--border)), var(--border))" }} />

            {stages.map((st, index) => {
              const isActive = activeStage === index;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStage(index)}
                  className={`card p-4 text-left border relative transition-all duration-300 ${
                    isActive
                      ? "ring-2 shadow-lg"
                      : "hover:border-[color-mix(in_srgb,var(--brand)_40%,var(--border))] hover:shadow-sm"
                  }`}
                  style={{
                    borderColor: isActive ? "var(--brand)" : "var(--border)",
                    boxShadow: isActive ? "0 8px 30px color-mix(in srgb, var(--brand) 12%, transparent)" : "",
                  }}
                >
                  {/* Top-Right Badge Number */}
                  <div className="absolute top-2 right-2 text-[10px] font-bold text-muted bg-surface-subtle border border-subtle h-5 w-5 rounded-full flex items-center justify-center">
                    {st.id}
                  </div>

                  {/* Flow Dot Indicator */}
                  <div
                    className="h-3.5 w-3.5 rounded-full mb-3 flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, var(--brand), var(--brand-2))"
                        : "var(--border-strong)"
                    }}
                  >
                    {isActive && <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />}
                  </div>

                  <div className="font-bold text-[13px] text-strong line-clamp-1">
                    {st.title}
                  </div>
                  <div className="text-[11px] text-muted line-clamp-1 mt-0.5">
                    {st.actor}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details Panel */}
          <div
            className="card p-8 border border-subtle relative overflow-hidden transition-all duration-300 animate-float"
            style={{
              background: "color-mix(in srgb, var(--surface-subtle) 25%, var(--surface))",
              animationDuration: "8s",
            }}
          >
            {/* Soft decorative background bloom */}
            <div
              className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-2))" }}
            />

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className="badge text-[10px]"
                    style={{
                      background: "color-mix(in srgb, var(--brand) 12%, transparent)",
                      color: "var(--brand)"
                    }}
                  >
                    {currentStage.badge}
                  </span>
                  <div className="text-xs text-muted font-semibold uppercase tracking-wider">
                    Stage {currentStage.id} of 6
                  </div>
                </div>

                <h3 className="text-2xl font-black text-strong mt-3">
                  {currentStage.title}
                </h3>
                <p className="text-[13px] text-brand-2 font-medium tracking-wide mt-0.5">
                  {currentStage.subtitle}
                </p>

                <p className="mt-4 text-muted text-sm leading-relaxed max-w-xl">
                  {currentStage.description}
                </p>
              </div>

              {/* Data parameters output pane */}
              <div className="w-full md:w-80 shrink-0 border border-subtle rounded-2xl p-5 bg-surface/50 backdrop-blur-sm">
                <div className="text-xs font-bold text-strong uppercase tracking-wider mb-3">
                  Key Metrics & Data
                </div>
                <ul className="space-y-2.5">
                  {currentStage.details.map((dt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-muted">
                      <span className="text-brand font-bold mt-0.5">✦</span>
                      <span>{dt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: ACTOR WALKTHROUGH TABS ── */}
        <section className="mb-12 border-t pt-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-strong">
              Role-Based Workflows
            </h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Explore your specific dashboard features and task limits by selecting your portal type.
            </p>
          </div>

          {/* Role selector tab headers */}
          <div className="flex overflow-x-auto pb-2 border-b gap-1 sm:gap-4 justify-center">
            {(Object.keys(stepsByRole) as Role[]).map((role) => {
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-5 py-2.5 font-bold text-xs sm:text-sm whitespace-nowrap rounded-t-xl transition-all duration-300 border-b-2 relative ${
                    isSelected
                      ? "text-brand"
                      : "text-muted hover:text-strong hover:bg-surface-subtle"
                  }`}
                  style={{
                    borderBottomColor: isSelected ? "var(--brand)" : "transparent",
                  }}
                >
                  {role}
                  {isSelected && (
                    <span
                      className="absolute bottom-[-2px] inset-x-0 h-[2px] blur-[1px]"
                      style={{ background: "var(--brand)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content list */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-center">
            {stepsByRole[activeRole].map((step, idx) => (
              <div
                key={idx}
                className="card p-6 surface-card border border-subtle card-interactive relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Visual Accent Corner Glow */}
                <div
                  className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-2))" }}
                />

                <div>
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                    style={{
                      background: "color-mix(in srgb, var(--brand) 8%, transparent)",
                      color: "var(--brand)"
                    }}
                  >
                    {step.icon}
                  </div>

                  <h3 className="font-extrabold text-sm text-strong uppercase tracking-wider">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 text-[10px] font-bold text-brand flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="btn-primary px-8 py-3 rounded-full text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
          </Link>
        </div>
      </main>
    </div>
  );
}
