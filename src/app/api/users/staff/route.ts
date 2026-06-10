import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["admin", "committee", "assessor"])) {
    return deny();
  }

  await connectToMongo();

  const staff = await User.find({
    role: { $in: ["admin", "committee", "assessor"] },
    isActive: true,
  })
    .select("firstName lastName email role")
    .sort({ firstName: 1, lastName: 1 });

  return NextResponse.json({ ok: true, items: staff });
}
