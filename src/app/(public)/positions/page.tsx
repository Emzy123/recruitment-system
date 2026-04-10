import Link from "next/link";
import { connectToMongo } from "@/lib/mongodb";
import { Position } from "@/lib/db/models/Position";

export const dynamic = "force-dynamic";

function readSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    search: (get("search") ?? "").trim(),
    type: get("type"),
    experienceLevel: get("experienceLevel"),
    department: get("department"),
    isRemote: get("isRemote"),
    page: Number(get("page") ?? "1"),
    limit: Number(get("limit") ?? "12"),
  };
}

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qp = readSearchParams(searchParams);
  const page = Math.max(1, qp.page || 1);
  const limit = Math.max(1, Math.min(50, qp.limit || 12));

  await connectToMongo();

  const filter: any = { isActive: true };
  if (qp.type) filter.type = qp.type;
  if (qp.experienceLevel) filter.experienceLevel = qp.experienceLevel;
  if (qp.department) filter.department = qp.department;
  if (qp.isRemote !== undefined) filter.isRemote = qp.isRemote === "true";
  if (qp.search) {
    filter.$or = [
      { title: { $regex: qp.search, $options: "i" } },
      { department: { $regex: qp.search, $options: "i" } },
      { location: { $regex: qp.search, $options: "i" } },
      { requiredSkills: { $regex: qp.search, $options: "i" } },
    ];
  }

  const total = await Position.countDocuments(filter);
  const items = await Position.find(filter)
    .sort({ postedDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen surface-page">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <aside className="w-full lg:w-72 card p-4">
            <div className="font-semibold text-strong">Filters</div>
            <form className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="search">
                  Search
                </label>
                <input
                  id="search"
                  name="search"
                  defaultValue={qp.search}
                  placeholder="Title, department, skills..."
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="label" htmlFor="type">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={qp.type ?? ""}
                  className="input mt-1"
                >
                  <option value="">Any</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label
                  className="label"
                  htmlFor="experienceLevel"
                >
                  Experience
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  defaultValue={qp.experienceLevel ?? ""}
                  className="input mt-1"
                >
                  <option value="">Any</option>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="department">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  defaultValue={qp.department ?? ""}
                  placeholder="e.g. Computer Science"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="label" htmlFor="isRemote">
                  Remote
                </label>
                <select
                  id="isRemote"
                  name="isRemote"
                  defaultValue={qp.isRemote ?? ""}
                  className="input mt-1"
                >
                  <option value="">Any</option>
                  <option value="true">Remote only</option>
                  <option value="false">On-site only</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-1 h-10"
                >
                  Apply
                </button>
                <Link
                  href="/positions"
                  className="btn-secondary h-10 px-3 flex items-center justify-center"
                >
                  Reset
                </Link>
              </div>

              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="limit" value={String(limit)} />
            </form>
          </aside>

          <section className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted">
                  Showing {items.length} of {total} roles
                </div>
                <h1 className="text-2xl font-semibold mt-1">Positions</h1>
              </div>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              {items.length === 0 ? (
                <div className="md:col-span-2 rounded-xl border border-subtle surface-card p-6 text-muted">
                  No positions match your filters.
                </div>
              ) : null}
              {items.map((p) => (
                <Link
                  key={p._id.toString()}
                  href={`/positions/${p._id.toString()}`}
                  className="rounded-xl border border-subtle surface-card p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-strong line-clamp-2">
                      {p.title}
                    </div>
                    {p.isRemote ? (
                      <span className="text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 px-2 py-1">
                        Remote
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm text-muted">
                    {p.department} · {p.location}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs rounded-full surface-subtle text-muted px-2 py-1 border border-subtle">
                      {p.type}
                    </span>
                    <span className="text-xs rounded-full surface-subtle text-muted px-2 py-1 border border-subtle">
                      {p.experienceLevel}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted">
                    Closing: {new Date(p.closingDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href={`/positions?page=${Math.max(1, page - 1)}&limit=${limit}`}
                className={page <= 1 ? "text-muted opacity-60" : "text-strong hover:underline"}
              >
                Previous
              </Link>
              <div className="text-sm text-muted">
                Page {page} of {pageCount}
              </div>
              <Link
                href={`/positions?page=${Math.min(pageCount, page + 1)}&limit=${limit}`}
                className={page >= pageCount ? "text-muted opacity-60" : "text-strong hover:underline"}
              >
                Next
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

