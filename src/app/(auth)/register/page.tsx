"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function stringifyApiError(err: unknown): string {
  if (!err) return "Registration failed.";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const e: any = err;
    const formErrors = Array.isArray(e?.formErrors) ? e.formErrors : [];
    const fieldErrorsObj = e?.fieldErrors && typeof e.fieldErrors === "object" ? e.fieldErrors : {};
    const fieldErrors = Object.values(fieldErrorsObj)
      .flat()
      .filter((x) => typeof x === "string") as string[];
    const msg = [...formErrors, ...fieldErrors][0];
    if (msg) return msg;
  }
  return "Registration failed.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(stringifyApiError(data?.error));
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen surface-page px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="hidden lg:flex card p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.16),transparent_40%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                FR
              </div>
              <div>
                <div className="font-semibold text-strong">Faculty Recruitment</div>
                <div className="text-sm text-muted">Create your candidate account</div>
              </div>
            </div>
            <h2 className="mt-8 text-3xl font-semibold tracking-tight text-strong">
              Apply with confidence
            </h2>
            <p className="mt-3 text-muted leading-7">
              Build a complete profile once, then apply to positions and take assessments with a clean, structured workflow.
            </p>
            <div className="mt-8 rounded-xl border border-subtle surface-glass p-4">
              <div className="text-xs text-muted">Tip</div>
              <div className="mt-1 text-sm text-strong">
                Use a strong password (8+ chars, at least 1 uppercase and 1 number).
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card p-6 sm:p-8" aria-label="Registration form">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-strong">
            Create account
          </h1>
          <p className="mt-2 text-muted">
            You’ll be registered as a candidate.
          </p>

          {error ? (
            <div role="alert" className="mt-5 rounded-lg bg-danger-subtle text-danger p-3 text-sm border border-subtle">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="input mt-2"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="input mt-2"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
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

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? "Creating…" : "Create account"}
          </button>

          <div className="mt-5 text-sm text-muted">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-700 font-semibold hover:underline">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

