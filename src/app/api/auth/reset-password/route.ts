import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/utils/bcrypt";
import { logAudit } from "@/lib/utils/audit";

const ResetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter")
    .refine((v) => /[0-9]/.test(v), "Password must include a number"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, newPassword } = parsed.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await connectToMongo();

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetTokenHash = "";
  user.passwordResetExpires = undefined;
  user.emailVerified = true; // allow login after reset
  await user.save();

  await logAudit({
    req,
    token: { uid: user._id.toString() },
    action: "password_reset",
    entityType: "User",
    entityId: user._id.toString(),
    details: {},
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

