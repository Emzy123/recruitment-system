import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { verifyPassword } from "@/lib/utils/bcrypt";
import { issueAuthToken } from "@/lib/auth";
import { logAudit } from "@/lib/utils/audit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

function assertRateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= max) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  attempts.set(key, { ...current, count: current.count + 1 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ip =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)?.headers?.get?.("x-forwarded-for") ??
    "unknown";

  const email = parsed.data.email.toLowerCase().trim();
  const windowMs = 60_000; // spec: 1 minute
  const max = 5; // spec: 5 attempts
  assertRateLimit(`${email}:${ip}`, windowMs, max);

  await connectToMongo();

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  user.lastLogin = new Date();
  await user.save();

  const token = await issueAuthToken({
    uid: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  };

  await logAudit({
    req,
    token: { uid: user._id.toString() },
    action: "user_login",
    entityType: "User",
    entityId: user._id.toString(),
    details: { role: user.role },
  });

  return NextResponse.json({ ok: true, user: safeUser, token }, { status: 200 });
}

