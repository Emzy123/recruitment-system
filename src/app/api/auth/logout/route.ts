import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // NextAuth cookie names (JWT strategy).
  // Clear both secure and non-secure variants.
  for (const cookieName of [
    "next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.session-token",
    "__Secure-next-auth.csrf-token",
  ]) {
    res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  }

  return res;
}

