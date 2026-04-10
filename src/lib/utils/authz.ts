import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export type AppRole = "candidate" | "committee" | "assessor" | "admin";

export async function getAuthToken(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  // First try direct request cast (works in some runtimes/adapters).
  const direct = await getToken({ req: req as any, secret });
  if (direct) return direct;

  // Fallback to explicit cookie header extraction.
  const cookie = req.headers.get("cookie") ?? headers().get("cookie") ?? "";
  if (!cookie) return null;
  const reqLike = { headers: { cookie } } as any;
  return getToken({ req: reqLike, secret });
}

export function deny(status = 403, error = "Forbidden") {
  return NextResponse.json({ ok: false, error }, { status });
}

export function hasAnyRole(
  role: string | undefined,
  allowed: AppRole[]
): role is AppRole {
  if (!role) return false;
  return allowed.includes(role as AppRole);
}

