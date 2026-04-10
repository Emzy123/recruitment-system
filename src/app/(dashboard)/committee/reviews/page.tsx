import Link from "next/link";

export default function CommitteeReviewsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto card p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-strong">Reviews</h1>
        <p className="text-muted">
          Pending and completed application reviews will be listed here. For now, use the pipeline and
          application detail pages to review candidates.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/committee" className="btn-primary">
            Open pipeline
          </Link>
          <Link href="/committee/applications" className="btn-secondary">
            Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
