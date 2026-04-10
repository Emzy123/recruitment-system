import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToMongo } from "@/lib/mongodb";
import { Position } from "@/lib/db/models/Position";

export const dynamic = "force-dynamic";

export default async function PositionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await connectToMongo();

  const position = await Position.findOne({ _id: params.id, isActive: true });
  if (!position) return notFound();

  await Position.updateOne({ _id: params.id }, { $inc: { viewCount: 1 } });
  const updated = await Position.findById(params.id);
  if (!updated) return notFound();

  const similar = await Position.find({
    _id: { $ne: params.id },
    isActive: true,
    department: updated.department,
  })
    .sort({ postedDate: -1 })
    .limit(4);

  return (
    <div className="min-h-screen surface-page">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="border border-subtle rounded-2xl p-6 shadow-sm surface-card">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-semibold text-strong">
                  {updated.title}
                </h1>
                {updated.isRemote ? (
                  <span className="text-xs font-medium rounded-full bg-success-subtle text-success border border-subtle px-2 py-1">
                    Remote
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-muted">
                {updated.department} · {updated.location}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-zinc-100 text-zinc-700 px-2 py-1">
                  {updated.type}
                </span>
                <span className="text-xs rounded-full bg-zinc-100 text-zinc-700 px-2 py-1">
                  {updated.experienceLevel}
                </span>
                <span className="text-xs rounded-full bg-zinc-100 text-zinc-700 px-2 py-1">
                  Posted {new Date(updated.postedDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="lg:w-72 w-full">
              <div className="rounded-xl border border-subtle surface-subtle p-4">
                <div className="text-sm text-muted">Closing date</div>
                <div className="font-semibold mt-1">
                  {new Date(updated.closingDate).toLocaleDateString()}
                </div>
                {typeof updated.salaryMin === "number" ||
                typeof updated.salaryMax === "number" ? (
                  <div className="mt-4 text-sm text-muted">
                    Salary:{" "}
                    <span className="text-strong font-medium">
                      {typeof updated.salaryMin === "number"
                        ? `$${updated.salaryMin}`
                        : ""}
                      {typeof updated.salaryMax === "number"
                        ? ` - $${updated.salaryMax}`
                        : ""}
                    </span>
                  </div>
                ) : null}

                <Link
                  href="/candidate/applications/new"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg btn-primary px-4 py-2 font-medium"
                >
                  Apply
                </Link>
                <div className="mt-2 text-xs text-muted opacity-60">
                  You can submit a multi-step application and files.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <section>
                <h2 className="text-lg font-semibold text-strong">
                  Description
                </h2>
                <p className="mt-2 text-muted whitespace-pre-wrap">
                  {updated.description}
                </p>
              </section>

              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-sm font-semibold text-strong">
                    Requirements
                  </h3>
                  {updated.requirements.length ? (
                    <ul className="mt-2 space-y-2 text-sm text-muted">
                      {updated.requirements.map((r, idx) => (
                        <li key={`${idx}-${r}`}>• {r}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm text-muted opacity-60">
                      No requirements listed.
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-strong">
                    Responsibilities
                  </h3>
                  {updated.responsibilities.length ? (
                    <ul className="mt-2 space-y-2 text-sm text-muted">
                      {updated.responsibilities.map((r, idx) => (
                        <li key={`${idx}-${r}`}>• {r}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm text-muted opacity-60">
                      No responsibilities listed.
                    </div>
                  )}
                </section>
              </div>

              <section className="mt-6">
                <h3 className="text-sm font-semibold text-strong">
                  Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...updated.requiredSkills.map((s) => `Required: ${s}`), ...updated.preferredSkills.map((s) => `Preferred: ${s}`)].slice(0, 18).map((label) => (
                    <span
                      key={label}
                      className="text-xs rounded-full bg-zinc-100 text-zinc-700 px-2 py-1"
                    >
                      {label}
                    </span>
                  ))}
                  {updated.requiredSkills.length + updated.preferredSkills.length === 0 ? (
                    <span className="text-sm text-muted opacity-60">No skills listed.</span>
                  ) : null}
                </div>
              </section>
            </div>

            <aside className="md:col-span-1">
              <h2 className="text-lg font-semibold text-strong">Similar positions</h2>
              <div className="mt-3 space-y-3">
                {similar.length === 0 ? (
                  <div className="text-sm text-muted opacity-60">No similar positions found.</div>
                ) : null}
                {similar.map((p) => (
                  <Link
                    key={p._id.toString()}
                    href={`/positions/${p._id.toString()}`}
                    className="block rounded-xl border border-subtle surface-card p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="font-semibold text-strong line-clamp-2">
                      {p.title}
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {p.department} · {p.location}
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

