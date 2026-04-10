import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { getAuthToken, deny, hasAnyRole } from "@/lib/utils/authz";

export async function GET(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["candidate", "assessor", "admin", "committee"])) {
    return deny();
  }

  await connectToMongo();
  const invitation = await AssessmentInvitation.findById(
    new mongoose.Types.ObjectId(context.params.id)
  )
    .populate("applicationId", "status coverLetter positionId candidateId")
    .populate("assessmentId", "title description durationMinutes passingScore")
    .populate("candidateId", "firstName lastName email");

  if (!invitation) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (token.role === "candidate" && invitation.candidateId.toString() !== token.uid) {
    return deny();
  }

  return NextResponse.json({ ok: true, invitation });
}

