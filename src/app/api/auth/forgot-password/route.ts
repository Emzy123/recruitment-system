import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { sendPasswordResetEmail } from "@/lib/utils/email";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  const email = parsed.data.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  // Never reveal whether the user exists.
  const response = NextResponse.json({ ok: true });

  if (!user) {
    return response;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpires = expires;
  await user.save();

  const appUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });

  return response;
}

