"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not reset password.");
        return;
      }

      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/login"), 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen surface-page px-4 py-10 flex items-center justify-center">
      <form onSubmit={onSubmit} className="card w-full max-w-lg p-6 sm:p-8" aria-label="Reset password form">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            FR
          </div>
          <div>
            <div className="font-semibold text-strong">Set a new password</div>
            <div className="text-sm text-muted">Choose a strong password for your account.</div>
          </div>
        </div>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-strong">
          Update password
        </h1>
        <p className="mt-2 text-muted">
          Your reset link must include a token. If you opened this page directly, request a new link.
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

        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input mt-2"
              autoComplete="new-password"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input mt-2"
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-3">
          {isLoading ? "Updating…" : "Update password"}
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

