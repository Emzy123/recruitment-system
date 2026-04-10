"use client";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "assessor" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.items ?? []));
  }, []);

  async function updateRole(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const d = await fetch("/api/admin/users").then((r) => r.json());
    setUsers(d.items ?? []);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const d = await res.json();
    setLoading(false);
    if (!d.ok) {
        setError(typeof d.error === "string" ? d.error : JSON.stringify(d.error));
        return;
    }
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "assessor" });
    const fresh = await fetch("/api/admin/users").then((r) => r.json());
    setUsers(fresh.items ?? []);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto card p-6">
        <h1 className="text-2xl font-semibold text-strong">User Management</h1>

        <form onSubmit={handleCreateUser} className="mt-6 border border-[color:var(--border)] rounded-lg p-4 surface-card max-w-2xl">
          <h2 className="text-xl font-medium mb-4 text-strong">Create New User</h2>
          {error && <div className="text-red-500 mb-4 font-medium text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="First Name" className="input" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
             <input type="text" placeholder="Last Name" className="input" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
             <input type="email" placeholder="Email Address" className="input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
             <input type="text" placeholder="Initial Password" minLength={8} className="input" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
             <div className="col-span-2 sm:col-span-1">
               <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input w-full py-2 disabled:opacity-50" required>
                 <option value="assessor">Assessor</option>
                 <option value="committee">Committee</option>
               </select>
             </div>
             <div className="col-span-2 sm:col-span-1 flex items-end">
               <button type="submit" disabled={loading} className="btn btn-primary w-full py-2">
                 {loading ? "Creating..." : "Create User"}
               </button>
             </div>
          </div>
        </form>

        <div className="mt-10 space-y-8">
          {[
            { title: "Candidates", data: users.filter(u => u.role === "candidate") },
            { title: "Assessors", data: users.filter(u => u.role === "assessor") },
            { title: "Committee", data: users.filter(u => u.role === "committee") },
            { title: "Admins", data: users.filter(u => u.role === "admin") }
          ].map(section => section.data.length > 0 && (
            <div key={section.title}>
              <h3 className="text-lg font-medium text-strong mb-3">{section.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[color:var(--border)] text-muted text-sm">
                      <th className="py-2 font-normal pl-2 whitespace-nowrap">Name</th>
                      <th className="py-2 font-normal whitespace-nowrap">Email</th>
                      <th className="py-2 font-normal text-right pr-2 whitespace-nowrap">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.data.map(u => (
                      <tr key={u._id} className="border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 align-middle text-strong font-medium pl-2 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                        <td className="py-3 align-middle text-muted whitespace-nowrap">{u.email}</td>
                        <td className="py-3 align-middle text-right pr-2 whitespace-nowrap">
                          <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="input w-auto min-w-[130px] py-1.5 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none outline-none ring-0">
                            <option value="candidate">candidate</option>
                            <option value="committee">committee</option>
                            <option value="assessor">assessor</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

