"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        setError("Invalid email or password");
        return;
      }

      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        setError("Logged in, but could not load your profile.");
        return;
      }

      const me = await meRes.json();
      const role = me?.user?.role as string | undefined;
      if (role === "admin") router.push("/admin");
      else if (role === "committee") router.push("/committee");
      else router.push("/candidate");
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
                <div className="text-sm text-muted">Recruit. Assess. Hire.</div>
              </div>
            </div>
            <h2 className="mt-8 text-3xl font-semibold tracking-tight text-strong">
              Welcome back
            </h2>
            <p className="mt-3 text-muted leading-7">
              Sign in to manage applications, take assessments, and review candidates with a structured workflow.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-subtle surface-glass p-4">
                <div className="text-xs text-muted">Fast access</div>
                <div className="mt-1 font-semibold text-strong">Role dashboards</div>
              </div>
              <div className="rounded-xl border border-subtle surface-glass p-4">
                <div className="text-xs text-muted">Secure</div>
                <div className="mt-1 font-semibold text-strong">JWT sessions</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card p-6 sm:p-8" aria-label="Login form">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-strong">
            Sign in
          </h1>
          <p className="mt-2 text-muted">
            Use your email and password to continue.
          </p>

          {error ? (
            <div role="alert" className="mt-5 rounded-lg bg-danger-subtle text-danger p-3 text-sm border border-subtle">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
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
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 py-3">
            {isLoading ? "Signing in…" : "Sign in"}
          </button>

          <div className="mt-5 flex items-center justify-between text-sm">
            <a href="/register" className="text-indigo-700 font-semibold hover:underline">
              Create account
            </a>
            <a href="/forgot-password" className="text-muted hover:text-strong hover:underline">
              Forgot password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

