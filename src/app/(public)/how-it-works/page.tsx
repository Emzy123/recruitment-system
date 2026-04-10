import Link from "next/link";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

function roleDashboard(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "committee") return "/committee";
  if (role === "assessor") return "/assessor";
  return "/candidate";
}

export default async function HowItWorksPage() {
  const cookieHeader = headers().get("cookie") ?? "";
  const reqLike = {
    headers: {
      cookie: cookieHeader,
    },
  } as any;

  const token = await getToken({
    req: reqLike,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = Boolean(token);
  const dashboardHref = roleDashboard((token?.role as string | undefined) ?? null);

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
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-strong">How it works</h1>
          <p className="mt-3 text-muted text-lg">
            A simple, transparent workflow for candidates, assessors, committee members, and admins.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold text-strong">Apply</div>
                  <p className="mt-1 text-muted">
                    Browse open positions and submit an application with your profile and materials.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold text-strong">Assess</div>
                  <p className="mt-1 text-muted">
                    Complete required assessments (timed, scored, and reviewable) when invited.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold text-strong">Review & decide</div>
                  <p className="mt-1 text-muted">
                    Committees review applications and assessments, track status in the pipeline, and record decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/positions" className="btn-primary px-5 py-3">
              Browse positions
            </Link>
            {isLoggedIn ? (
              <Link href={dashboardHref} className="btn-secondary px-5 py-3">
                Go to dashboard
              </Link>
            ) : (
              <Link href="/register" className="btn-secondary px-5 py-3">
                Create account
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

