import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/utils/bcrypt";
import { issueAuthToken } from "@/lib/auth";
import { logAudit } from "@/lib/utils/audit";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter")
    .refine((v) => /[0-9]/.test(v), "Password must include a number"),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Email already in use" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await User.create({
    email,
    passwordHash,
    firstName: parsed.data.firstName.trim(),
    lastName: parsed.data.lastName.trim(),
    role: "candidate",
    isActive: true,
    emailVerified: false,
  });

  const token = await issueAuthToken({
    uid: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  await logAudit({
    req,
    token: { uid: user._id.toString() },
    action: "user_registered",
    entityType: "User",
    entityId: user._id.toString(),
    details: { role: user.role },
  });

  const safeUser = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  };

  return NextResponse.json({ ok: true, user: safeUser, token }, { status: 201 });
}

