"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Question {
  title: string;
  description: string;
  type: "coding" | "multiple_choice" | "essay";
  points: number;
  order: number;
  programmingLanguage?: string;
  starterCode?: string;
  testCases?: TestCase[];
  options?: string[];
  correctAnswer?: string;
  rubricText?: string;
}

export default function AssessorCreateAssessmentPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<any[]>([]);
  const [positionId, setPositionId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<"coding" | "multiple_choice" | "essay">("coding");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(50);
  const [instructions, setInstructions] = useState("Solve all questions within the time limit.");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      title: "Question 1",
      description: "",
      type: "coding",
      points: 100,
      order: 1,
      programmingLanguage: "python",
      starterCode: "",
      testCases: [{ input: "", expectedOutput: "", isHidden: false }],
      options: ["", ""],
      correctAnswer: "",
      rubricText: "",
    },
  ]);

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((d) => {
        setPositions(d.items ?? []);
        if (d.items?.[0]?._id) setPositionId(d.items[0]._id);
      })
      .catch(() => setPositions([]));
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: `Question ${questions.length + 1}`,
        description: "",
        type: "coding",
        points: 50,
        order: questions.length + 1,
        programmingLanguage: "python",
        starterCode: "",
        testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        options: ["", ""],
        correctAnswer: "",
        rubricText: "",
      },
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    const updated = questions.filter((_, idx) => idx !== qIndex).map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));
    setQuestions(updated);
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], [field]: value };
    setQuestions(updated);
  };

  const updateTestCase = (qIndex: number, tIndex: number, field: keyof TestCase, value: any) => {
    const q = questions[qIndex];
    if (!q.testCases) return;
    const testCases = [...q.testCases];
    testCases[tIndex] = { ...testCases[tIndex], [field]: value };
    updateQuestion(qIndex, "testCases", testCases);
  };

  const addTestCase = (qIndex: number) => {
    const q = questions[qIndex];
    const testCases = [...(q.testCases ?? []), { input: "", expectedOutput: "", isHidden: false }];
    updateQuestion(qIndex, "testCases", testCases);
  };

  const removeTestCase = (qIndex: number, tIndex: number) => {
    const q = questions[qIndex];
    const testCases = (q.testCases ?? []).filter((_, idx) => idx !== tIndex);
    updateQuestion(qIndex, "testCases", testCases);
  };

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    const options = [...(q.options ?? []), ""];
    updateQuestion(qIndex, "options", options);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const q = questions[qIndex];
    const options = (q.options ?? []).filter((_, idx) => idx !== oIndex);
    updateQuestion(qIndex, "options", options);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const options = [...q.options];
    options[oIndex] = text;
    updateQuestion(qIndex, "options", options);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    // Prepare payload
    const formattedQuestions = questions.map((q) => {
      const formatted: any = {
        title: q.title,
        description: q.description,
        type: q.type,
        points: Number(q.points),
        order: Number(q.order),
      };

      if (q.type === "coding") {
        formatted.programmingLanguage = q.programmingLanguage;
        formatted.starterCode = q.starterCode;
        formatted.testCases = (q.testCases ?? []).map((t) => ({
          input: t.input,
          expectedOutput: t.expectedOutput,
          isHidden: !!t.isHidden,
        }));
      } else if (q.type === "multiple_choice") {
        formatted.options = (q.options ?? []).filter((o) => o.trim() !== "");
        formatted.correctAnswer = q.correctAnswer;
      } else if (q.type === "essay") {
        formatted.rubric = { criteria: q.rubricText };
      }

      return formatted;
    });

    try {
      const res = await fetch("/api/assessments/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId,
          title,
          description,
          type: assessmentType,
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          instructions,
          questions: formattedQuestions,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error ? JSON.stringify(json.error) : "Failed to create assessment template.");
        return;
      }

      router.push("/assessor");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-6 surface-page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-strong">Create Assessment Template</h1>
          <p className="text-muted text-sm mt-1">
            Design a detailed assessment template with multiple custom questions, test cases, and rubrics.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-strong text-lg border-b border-subtle pb-2">1. Template Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="position">Job Position</label>
                <select
                  id="position"
                  className="input mt-1 w-full rounded-md"
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a position</option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="assessmentType">Primary Assessment Type</label>
                <select
                  id="assessmentType"
                  className="input mt-1 w-full rounded-md"
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as any)}
                >
                  <option value="coding">Coding Sandbox</option>
                  <option value="multiple_choice">Multiple Choice Questions</option>
                  <option value="essay">Written Essay / Statements</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="title">Template Title</label>
              <input
                id="title"
                className="input mt-1 w-full rounded-md"
                placeholder="e.g., Senior Systems Architecture Assessment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="description">Template Description</label>
              <textarea
                id="description"
                className="input mt-1 w-full rounded-md"
                rows={3}
                placeholder="Brief summary of what this assessment evaluates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  className="input mt-1 w-full rounded-md"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={5}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="passing">Passing Score (pts or %)</label>
                <input
                  id="passing"
                  type="number"
                  className="input mt-1 w-full rounded-md"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="instructions">Candidate Instructions</label>
              <textarea
                id="instructions"
                className="input mt-1 w-full rounded-md"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-subtle pb-2">
              <h2 className="font-semibold text-strong text-lg">2. Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                + Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-muted text-sm text-center py-4">No questions added yet. Click "+ Add Question" to start.</p>
            ) : null}

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border border-subtle rounded-xl p-4 surface-subtle space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-strong">Question #{qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Delete Question
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Question Title</label>
                    <input
                      className="input mt-1 w-full rounded-md bg-white"
                      value={q.title}
                      onChange={(e) => updateQuestion(qIndex, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Question Type</label>
                    <select
                      className="input mt-1 w-full rounded-md bg-white"
                      value={q.type}
                      onChange={(e) => updateQuestion(qIndex, "type", e.target.value as any)}
                    >
                      <option value="coding">Coding sandbox</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="essay">Written Essay / Statement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Question Description / Prompt</label>
                  <textarea
                    className="input mt-1 w-full rounded-md bg-white"
                    rows={3}
                    placeholder="Write the question text or prompt here..."
                    value={q.description}
                    onChange={(e) => updateQuestion(qIndex, "description", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Weight (Points)</label>
                    <input
                      type="number"
                      className="input mt-1 w-full rounded-md bg-white"
                      value={q.points}
                      onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Display Order</label>
                    <input
                      type="number"
                      className="input mt-1 w-full rounded-md bg-white"
                      value={q.order}
                      onChange={(e) => updateQuestion(qIndex, "order", Number(e.target.value))}
                      min={1}
                      required
                    />
                  </div>
                </div>

                {/* Question Type Specific Details */}
                {q.type === "coding" && (
                  <div className="border-t border-subtle/60 pt-4 space-y-4">
                    <h4 className="text-xs font-semibold text-strong uppercase tracking-wider">Coding Environment</h4>
                    
                    <div>
                      <label className="label">Programming Language</label>
                      <select
                        className="input mt-1 w-full rounded-md bg-white"
                        value={q.programmingLanguage || "python"}
                        onChange={(e) => updateQuestion(qIndex, "programmingLanguage", e.target.value)}
                      >
                        <option value="python">Python 3</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                        <option value="cpp">C++ (GCC)</option>
                        <option value="java">Java (OpenJDK)</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Starter Code (Optional)</label>
                      <textarea
                        className="input mt-1 w-full rounded-md font-mono text-sm bg-white"
                        rows={5}
                        placeholder="def solution():\n    # write code here"
                        value={q.starterCode || ""}
                        onChange={(e) => updateQuestion(qIndex, "starterCode", e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="label font-semibold">Test Cases</label>
                        <button
                          type="button"
                          onClick={() => addTestCase(qIndex)}
                          className="btn-secondary text-[10px] px-2 py-1"
                        >
                          + Add Test Case
                        </button>
                      </div>

                      {(q.testCases ?? []).map((test, tIdx) => (
                        <div key={tIdx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-white p-3 rounded-lg border border-subtle">
                          <div>
                            <label className="text-[10px] text-muted font-semibold">Input</label>
                            <input
                              className="input w-full mt-0.5 rounded text-xs bg-gray-50"
                              placeholder="e.g. 1 2"
                              value={test.input}
                              onChange={(e) => updateTestCase(qIndex, tIdx, "input", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted font-semibold">Expected Output</label>
                            <input
                              className="input w-full mt-0.5 rounded text-xs bg-gray-50"
                              placeholder="e.g. 3"
                              value={test.expectedOutput}
                              onChange={(e) => updateTestCase(qIndex, tIdx, "expectedOutput", e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted mb-2">
                              <input
                                type="checkbox"
                                checked={test.isHidden}
                                onChange={(e) => updateTestCase(qIndex, tIdx, "isHidden", e.target.checked)}
                              />
                              Hidden Case
                            </label>
                            {(q.testCases ?? []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTestCase(qIndex, tIdx)}
                                className="text-xs text-red-500 hover:text-red-700 mb-1.5"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === "multiple_choice" && (
                  <div className="border-t border-subtle/60 pt-4 space-y-4">
                    <h4 className="text-xs font-semibold text-strong uppercase tracking-wider">Multiple Choice Options</h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="label">Options</label>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="btn-secondary text-[10px] px-2 py-1"
                        >
                          + Add Option
                        </button>
                      </div>

                      {(q.options ?? []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-subtle">
                          <span className="text-xs font-bold text-muted">{String.fromCharCode(65 + oIdx)}.</span>
                          <input
                            className="input flex-1 rounded text-xs bg-gray-50"
                            placeholder={`Option ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => updateOptionText(qIndex, oIdx, e.target.value)}
                            required
                          />
                          {(q.options ?? []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIdx)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="label">Correct Answer</label>
                      <select
                        className="input mt-1 w-full rounded-md bg-white"
                        value={q.correctAnswer || ""}
                        onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                        required
                      >
                        <option value="" disabled>Select correct answer</option>
                        {(q.options ?? []).map((opt, oIdx) => {
                          const val = opt.trim();
                          return (
                            <option key={oIdx} value={val} disabled={!val}>
                              Option {String.fromCharCode(65 + oIdx)}: {val || "(empty option)"}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                {q.type === "essay" && (
                  <div className="border-t border-subtle/60 pt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-strong uppercase tracking-wider">Evaluation Rubric</h4>
                    <label className="label">Grading Criteria & Rubric Instructions</label>
                    <textarea
                      className="input mt-1 w-full rounded-md bg-white"
                      rows={3}
                      placeholder="Specify what criteria (e.g. alignment, research rigor, tone) the assessor should evaluate and how points are distributed..."
                      value={q.rubricText || ""}
                      onChange={(e) => updateQuestion(qIndex, "rubricText", e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="card p-4 border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/assessor")}
              className="btn-secondary"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={busy}
            >
              {busy ? "Saving Template..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
