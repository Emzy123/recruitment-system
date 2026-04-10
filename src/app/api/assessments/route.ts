import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["assessor", "admin", "committee", "candidate"])) {
    return deny();
  }

  const url = new URL(req.url);
  const positionId = url.searchParams.get("positionId");
  const isActive = url.searchParams.get("isActive");

  await connectToMongo();
  const filter: any = {};
  if (positionId) filter.positionId = positionId;
  if (isActive !== null) filter.isActive = isActive === "true";

  const items = await AssessmentTemplate.find(filter).sort({ createdAt: -1 });
  return NextResponse.json({ ok: true, items });
}

