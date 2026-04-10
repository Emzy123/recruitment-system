import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentResult } from "@/lib/db/models/AssessmentResult";
import { Application } from "@/lib/db/models/Application";
import { getAuthToken, deny, hasAnyRole } from "@/lib/utils/authz";

export async function GET(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["candidate", "committee", "assessor", "admin"])) {
    return deny();
  }

  const url = new URL(req.url);
  const applicationId = url.searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ ok: false, error: "applicationId is required" }, { status: 400 });
  }

  await connectToMongo();

  const result = await AssessmentResult.findOne({
    assessmentId: new mongoose.Types.ObjectId(context.params.id),
    applicationId: new mongoose.Types.ObjectId(applicationId),
  });
  if (!result) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (token.role === "candidate") {
    const app = await Application.findById(applicationId);
    if (!app || app.candidateId.toString() !== token.uid) return deny();
  }

  return NextResponse.json({ ok: true, result });
}

