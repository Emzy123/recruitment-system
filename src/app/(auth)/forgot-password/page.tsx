"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not request reset.");
        return;
      }

      setMessage("If an account exists, we sent a reset link (or printed it to the console).");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen surface-page px-4 py-10 flex items-center justify-center">
      <form onSubmit={onSubmit} className="card w-full max-w-lg p-6 sm:p-8" aria-label="Forgot password form">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            FR
          </div>
          <div>
            <div className="font-semibold text-strong">Password reset</div>
            <div className="text-sm text-muted">We’ll email a reset link if the account exists.</div>
          </div>
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-strong">
          Reset your password
        </h1>
        <p className="mt-2 text-muted">
          Enter your email address to receive a reset link (local dev may print it to the console).
        </p>

        {error ? (
          <div role="alert" className="mt-5 rounded-lg bg-danger-subtle text-danger p-3 text-sm border border-subtle">
            {error}
          </div>
        ) : null}

        {message ? (
          <div role="status" className="mt-5 rounded-lg bg-success-subtle text-success p-3 text-sm border border-subtle">
            {message}
          </div>
        ) : null}

        <div className="mt-6">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input mt-2"
            placeholder="you@university.edu"
            autoComplete="email"
          />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-3">
          {isLoading ? "Sending…" : "Send reset link"}
        </button>

        <div className="mt-5 text-sm">
          <a href="/login" className="text-indigo-700 font-semibold hover:underline">
            Back to sign in
          </a>
        </div>
      </form>
    </div>
  );
}

