import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import crypto from "crypto";
import { logAudit } from "@/lib/utils/audit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase().trim();
  const token = body?.token;

  if (!email || !token) {
    return NextResponse.json({ ok: false, error: "Missing email or token" }, { status: 400 });
  }

  await connectToMongo();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid link" }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, message: "Email already verified" }, { status: 200 });
  }

  if (!user.emailVerificationTokenHash || !user.emailVerificationExpires) {
    return NextResponse.json({ ok: false, error: "No verification token found" }, { status: 400 });
  }

  if (user.emailVerificationExpires.getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Verification link expired" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (tokenHash !== user.emailVerificationTokenHash) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Optionally log the verification
  await logAudit({
    req,
    action: "email_verified",
    entityType: "User",
    entityId: user._id.toString(),
  });

  return NextResponse.json({ ok: true, message: "Email verified successfully" }, { status: 200 });
}
