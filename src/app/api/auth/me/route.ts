import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";

export async function GET(req: Request) {
  const token = await getToken({
    // NextAuth expects a NextRequest; in App Router this should still be compatible.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const uid = token?.uid as string | undefined;
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToMongo();
  const user = await User.findById(uid);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      profileImage: user.profileImage || undefined,
    },
  });
}

