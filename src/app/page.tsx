import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";
import { Position } from "@/lib/db/models/Position";

export const dynamic = "force-dynamic";

function roleDashboard(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "committee") return "/committee";
  if (role === "assessor") return "/assessor";
  return "/candidate";
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const token = session?.user as any;
  const isLoggedIn = Boolean(token);
  const dashboardHref = roleDashboard((token?.role as string | undefined) ?? null);

  await connectToMongo();
  const featured = await Position.find({ isActive: true })
    .sort({ postedDate: -1 })
    .limit(3);

  const totalPositions = await Position.countDocuments({ isActive: true });
  const departments = await Position.distinct("department", { isActive: true });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: "var(--surface-glass)",
          borderColor: "var(--border)",
        }}
      >
        <div className="app-container py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
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
                Recruit. Assess. Hire.
              </div>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-2">
            <Link
              href="/how-it-works"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] no-underline"
              style={{ color: "var(--muted)" }}
            >
              How It Works
            </Link>
            <Link
              href="/positions"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] no-underline"
              style={{ color: "var(--muted)" }}
            >
              Positions
            </Link>
            {isLoggedIn ? (
              <Link href={dashboardHref} className="btn-primary px-5 py-2.5 text-sm">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-primary px-5 py-2.5 text-sm">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="app-container pt-20 pb-16 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold mb-6"
              style={{
                background: "color-mix(in srgb, var(--brand) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--brand) 20%, var(--border))",
                color: "var(--brand)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "hsl(142 76% 36%)" }}
              />
              {totalPositions} positions open now
            </div>

            {/* Headline */}
            <h1
              className="text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6"
              style={{ color: "var(--foreground)" }}
            >
              Hire the{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                right faculty.
              </span>
              <br />
              Faster.
            </h1>

            {/* Sub-copy */}
            <p
              className="text-lg leading-relaxed mb-10 max-w-md"
              style={{ color: "var(--muted)" }}
            >
              One platform to post positions, run structured assessments,
              and reach confident hiring decisions — together.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-14">
              <Link href="/positions" className="btn-primary">
                Browse Positions
              </Link>
              {isLoggedIn ? (
                <Link href={dashboardHref} className="btn-secondary">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/login" className="btn-secondary">
                  Sign in
                </Link>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-8">
              <div>
                <div
                  className="text-3xl font-black"
                  style={{
                    background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {totalPositions}
                </div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                  Open roles
                </div>
              </div>
              <div
                className="w-px self-stretch"
                style={{ background: "var(--border)" }}
              />
              <div>
                <div
                  className="text-3xl font-black"
                  style={{
                    background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {departments.length}
                </div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                  Departments
                </div>
              </div>
              <div
                className="w-px self-stretch"
                style={{ background: "var(--border)" }}
              />
              <div>
                <div
                  className="text-3xl font-black"
                  style={{
                    background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  3
                </div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                  Steps to hire
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative flex items-center justify-center">
            {/* Glow blob */}
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(ellipse, color-mix(in srgb, var(--brand) 20%, transparent) 0%, transparent 70%)",
                animation: "pulse-glow 4s ease-in-out infinite",
              }}
            />
            {/* Image container */}
            <div
              className="relative w-full rounded-3xl overflow-hidden border"
              style={{
                borderColor: "color-mix(in srgb, var(--brand) 15%, var(--border))",
                boxShadow: "0 24px 80px color-mix(in srgb, var(--brand) 20%, transparent), 0 8px 32px color-mix(in srgb, var(--foreground) 6%, transparent)",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <Image
                src="/images/hero.png"
                alt="Faculty recruitment platform illustration"
                width={620}
                height={620}
                priority
                className="w-full h-auto block"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          className="py-20 border-y"
          style={{
            background: "color-mix(in srgb, var(--surface-subtle) 60%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <div className="app-container">
            <div className="text-center mb-12">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--brand)" }}
              >
                How it works
              </p>
              <h2
                className="text-3xl lg:text-4xl font-black"
                style={{ color: "var(--foreground)" }}
              >
                Three steps to your next hire
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: "Apply",
                  body: "Candidates complete a structured multi-step application with CV, cover letter, and supporting documents.",
                  icon: "✦",
                },
                {
                  num: "02",
                  title: "Assess",
                  body: "Timed coding challenges and skill assessments scored automatically — no manual grading needed.",
                  icon: "⚡",
                },
                {
                  num: "03",
                  title: "Decide",
                  body: "Committee reviews scores with shared rubrics and makes data-backed hiring decisions together.",
                  icon: "✓",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="card p-8 relative overflow-hidden group"
                >
                  {/* Gradient accent top */}
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background: "linear-gradient(90deg, transparent, var(--brand), transparent)",
                    }}
                  />
                  <div
                    className="text-4xl font-black mb-4 select-none"
                    style={{ color: "color-mix(in srgb, var(--brand) 15%, var(--border))" }}
                  >
                    {step.num}
                  </div>
                  <div
                    className="text-2xl mb-3"
                    style={{ color: "var(--brand)" }}
                  >
                    {step.icon}
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--foreground)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED POSITIONS ── */}
        <section className="app-container py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--brand)" }}
              >
                Latest opportunities
              </p>
              <h2
                className="text-3xl font-black"
                style={{ color: "var(--foreground)" }}
              >
                Featured positions
              </h2>
            </div>
            <Link
              href="/positions"
              className="text-sm font-semibold no-underline flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
              style={{ color: "var(--brand)" }}
            >
              View all
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="card p-10 text-center" style={{ color: "var(--muted)" }}>
              No active positions yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map((p) => (
                <Link
                  key={p._id.toString()}
                  href={`/positions/${p._id.toString()}`}
                  className="card card-interactive p-7 flex flex-col gap-5 no-underline group"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
                      style={{
                        background: "color-mix(in srgb, var(--brand) 10%, var(--surface-subtle))",
                        color: "var(--brand)",
                      }}
                    >
                      {p.department?.[0] ?? "?"}
                    </div>
                    {p.isRemote && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "color-mix(in srgb, hsl(142 76% 36%) 10%, transparent)",
                          color: "hsl(142 76% 30%)",
                        }}
                      >
                        Remote
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3
                      className="font-bold text-base leading-snug mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      {p.department} · {p.location}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      {p.type}
                    </span>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{
                        background: "var(--surface-subtle)",
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      {p.experienceLevel}
                    </span>
                  </div>

                  {/* Apply arrow */}
                  <div
                    className="text-xs font-bold flex items-center gap-1.5 transition-all duration-200 group-hover:gap-2.5"
                    style={{ color: "var(--brand)" }}
                  >
                    Apply now <span aria-hidden="true">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── CTA BANNER ── */}
        <section className="app-container pb-20">
          <div
            className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 90%, black), color-mix(in srgb, var(--brand-2) 80%, var(--brand)))",
            }}
          >
            {/* Decorative glows */}
            <div
              className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30"
              style={{ background: "white" }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
              style={{ background: "white" }}
            />

            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                Ready to find your next hire?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                Browse open faculty positions and apply in minutes.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/positions"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: "white", color: "var(--brand)" }}
                >
                  Browse Positions
                </Link>
                {!isLoggedIn && (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2 border-white/30 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60"
                  >
                    Create account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="app-container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
              }}
            >
              FR
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              FacultyRecruit
            </span>
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: "var(--muted)" }}>
            <a
              href="/positions"
              className="hover:text-[color:var(--foreground)] transition-colors no-underline"
            >
              Positions
            </a>
            <a
              href="/about"
              className="hover:text-[color:var(--foreground)] transition-colors no-underline"
            >
              About
            </a>
            <a
              href="/login"
              className="hover:text-[color:var(--foreground)] transition-colors no-underline"
            >
              Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
