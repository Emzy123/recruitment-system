"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMsg("Missing or invalid verification link.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(data?.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error occurred.");
      });
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 surface-page">
      <div className="card max-w-md w-full p-8 text-center shadow-lg border border-subtle">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-strong mb-2">Email Verification</h1>
        
        {status === "loading" && (
          <p className="text-muted">Verifying your email address. Please wait...</p>
        )}
        
        {status === "success" && (
          <>
            <p className="text-success mb-6 bg-success-subtle p-3 rounded-lg border border-success/20">
               Your email has been successfully verified!
            </p>
            <Link href="/login" className="btn-primary w-full py-3">
              Proceed to Login
            </Link>
          </>
        )}
        
        {status === "error" && (
          <>
            <p className="text-danger mb-6 bg-danger-subtle p-3 rounded-lg border border-danger/20">
              {errorMsg}
            </p>
            <Link href="/login" className="btn-secondary w-full py-3">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 surface-page">
        <div className="card max-w-md w-full p-8 text-center shadow-lg border border-subtle">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-strong mb-2">Email Verification</h1>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
