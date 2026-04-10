"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePositionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        department,
        type: "full-time",
        experienceLevel: "mid",
        description,
        requirements: [],
        responsibilities: [],
        requiredSkills: [],
        preferredSkills: [],
        location: "Main Campus",
        isRemote: false,
        postedDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      }),
    });
    router.push("/admin/positions");
  }

  return (
    <div className="min-h-screen surface-page p-6">
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto border border-subtle rounded-xl p-6 surface-card">
        <h1 className="text-2xl font-semibold text-strong">Create Position</h1>
        <input className="mt-4 w-full input rounded-md" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="mt-3 w-full input rounded-md" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <textarea className="mt-3 w-full input rounded-md" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        <button className="mt-4 btn-primary">Create</button>
      </form>
    </div>
  );
}

