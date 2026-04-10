import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { getAuthToken, deny, hasAnyRole } from "@/lib/utils/authz";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["candidate", "assessor", "admin", "committee"])) {
    return deny();
  }

  const url = new URL(req.url);
  const applicationId = url.searchParams.get("applicationId");
  const assessmentId = url.searchParams.get("assessmentId");
  const status = url.searchParams.get("status");

  await connectToMongo();

  const filter: any = {};
  if (applicationId) filter.applicationId = new mongoose.Types.ObjectId(applicationId);
  if (assessmentId) filter.assessmentId = new mongoose.Types.ObjectId(assessmentId);
  if (status) filter.status = status;

  if (token.role === "candidate") {
    if (typeof token.uid !== "string") return deny(401, "Unauthorized");
    filter.candidateId = new mongoose.Types.ObjectId(token.uid);
  }

  const items = await AssessmentInvitation.find(filter)
    .sort({ createdAt: -1 })
    .populate("applicationId", "status positionId submittedAt")
    .populate("assessmentId", "title durationMinutes passingScore positionId")
    .populate("candidateId", "firstName lastName email");

  return NextResponse.json({ ok: true, items });
}

