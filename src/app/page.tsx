import Link from "next/link";
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
    .limit(5);

  const totalPositions = await Position.countDocuments({ isActive: true });

  return (
    <div className="min-h-screen surface-page">
      <header className="border-b border-subtle surface-glass backdrop-blur">
        <div className="app-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              FR
            </div>
            <div>
              <div className="font-semibold">Faculty Recruitment System</div>
              <div className="text-sm text-muted">Recruit. Assess. Hire.</div>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/positions" className="text-muted hover:text-strong font-medium">
              Browse Positions
            </Link>
            {isLoggedIn ? (
              <Link href={dashboardHref} className="btn-secondary px-3 py-2">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-secondary px-3 py-2">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="app-container py-10">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-subtle surface-glass px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Now hiring across departments
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-strong">
              A modern faculty recruitment platform
            </h1>
            <p className="mt-4 text-muted text-lg">
              A modern platform for candidates to apply and for committees to review, run assessments, and make decisions with clarity.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/positions" className="btn-primary px-5 py-3">
                Browse Positions
              </Link>
              {isLoggedIn ? (
                <Link href={dashboardHref} className="btn-secondary px-5 py-3">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="btn-secondary px-5 py-3">
                  Login
                </Link>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="card p-4">
                <div className="text-xs text-muted">Open positions</div>
                <div className="mt-1 text-2xl font-semibold text-strong">{totalPositions}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Departments</div>
                <div className="mt-1 text-2xl font-semibold text-strong">—</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted">Applications</div>
                <div className="mt-1 text-2xl font-semibold text-strong">—</div>
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(79,70,229,0.12),transparent_40%),radial-gradient(circle_at_90%_30%,rgba(14,165,233,0.10),transparent_45%)]" />
            <div className="flex items-center justify-between">
              <div className="font-semibold relative">How it works</div>
              <div className="text-sm text-muted">3 steps</div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Apply</div>
                  <div className="text-sm text-muted">
                    Complete the multi-step application with resume and details.
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Assess</div>
                  <div className="text-sm text-muted">
                    Take coding challenges with automated scoring and timed sessions.
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Review & decide</div>
                  <div className="text-sm text-muted">
                    Committee members use rubrics to evaluate and make decisions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured positions</h2>
              <p className="text-muted mt-1">Browse the latest roles and apply.</p>
            </div>
            <Link href="/positions" className="text-sm font-medium text-strong hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {featured.length === 0 ? (
              <div className="md:col-span-3 card p-6 text-muted">
                No active positions yet.
              </div>
            ) : null}
            {featured.map((p) => (
              <Link
                key={p._id.toString()}
                href={`/positions/${p._id.toString()}`}
                className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-strong line-clamp-2">
                    {p.title}
                  </div>
                  {p.isRemote ? (
                    <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Remote
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-muted">
                  {p.department} · {p.location}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge surface-subtle text-muted border border-subtle">
                    {p.type}
                  </span>
                    <span className="badge surface-subtle text-muted border border-subtle">
                    {p.experienceLevel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-subtle surface-card">
        <div className="app-container py-8 text-sm text-muted flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Faculty Recruitment System</div>
          <div className="flex gap-4">
            <a href="/positions" className="hover:text-strong">
              Positions
            </a>
            <a href="/about" className="hover:text-strong">
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
