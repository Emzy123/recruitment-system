import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Application } from "@/lib/db/models/Application";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "committee") return deny();

  await connectToMongo();
  const items = await Application.find({
    status: { $in: ["committee_review", "review", "interview", "assessment_completed"] },
  })
    .sort({ updatedAt: -1 })
    .populate("candidateId", "firstName lastName email")
    .populate("positionId", "title department");

  return NextResponse.json({ ok: true, items });
}

