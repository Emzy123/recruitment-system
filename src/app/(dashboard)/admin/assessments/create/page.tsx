"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [positionId, setPositionId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((d) => {
        setPositions(d.items ?? []);
        if (d.items?.[0]?._id) setPositionId(d.items[0]._id);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/assessments/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positionId,
        title,
        description,
        type: "coding",
        durationMinutes: 60,
        passingScore: 50,
        instructions: "Solve all questions.",
        questions: [
          {
            title: "Sum two numbers",
            description: "Read two integers and print sum.",
            type: "coding",
            points: 100,
            order: 1,
            programmingLanguage: "python",
            starterCode: "",
            testCases: [
              { input: "1 2", expectedOutput: "3", isHidden: false },
              { input: "10 5", expectedOutput: "15", isHidden: true },
            ],
          },
        ],
      }),
    });
    router.push("/admin/assessments");
  }

  return (
    <div className="min-h-screen surface-page p-6">
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto border border-subtle rounded-xl p-6 surface-card">
        <h1 className="text-2xl font-semibold text-strong">Create Assessment Template</h1>
        <select className="mt-4 w-full input rounded-md" value={positionId} onChange={(e) => setPositionId(e.target.value)}>
          {positions.map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
        <input className="mt-3 w-full input rounded-md" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="mt-3 w-full input rounded-md" rows={5} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="mt-4 btn-primary">Create</button>
      </form>
    </div>
  );
}

