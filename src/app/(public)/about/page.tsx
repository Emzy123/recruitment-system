import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen surface-page">
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="card p-6">
          <h1 className="text-3xl font-semibold text-strong">About</h1>
          <p className="mt-4 text-muted">
            The Faculty Recruitment System helps candidates apply, committees review, and hiring decisions move forward with structured assessments and transparent evaluation.
          </p>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-strong">What’s next?</h2>
            <p className="mt-2 text-muted">
              This is an ongoing build: authentication, position management, and public browsing are working now. Next we’ll add multi-step applications, technical assessments (Judge0 integration), committee rubrics, and the admin dashboard.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              href="/positions"
              className="btn-primary"
            >
              Browse positions
            </Link>
            <Link
              href="/login"
              className="btn-secondary"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

