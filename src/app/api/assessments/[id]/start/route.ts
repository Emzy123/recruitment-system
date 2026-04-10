import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Application } from "@/lib/db/models/Application";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { AssessmentResult } from "@/lib/db/models/AssessmentResult";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { logAudit } from "@/lib/utils/audit";
import { createNotification } from "@/lib/utils/notifications";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const token = await getAuthToken(req);
    if (!token || token.role !== "candidate" || typeof token.uid !== "string") {
      return deny(401, "Unauthorized");
    }

    const body = await req.json().catch(() => ({}));
    const applicationId = body.applicationId as string | undefined;
    if (!applicationId) {
      return NextResponse.json({ ok: false, error: "applicationId is required" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(applicationId)) {
      return NextResponse.json({ ok: false, error: "Invalid applicationId" }, { status: 400 });
    }

    const assessmentId = context.params.id;
    if (!mongoose.isValidObjectId(assessmentId)) {
      return NextResponse.json({ ok: false, error: "Invalid assessment id" }, { status: 400 });
    }

    await connectToMongo();

    const app = await Application.findById(applicationId);
    if (!app) {
      return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
    }
    if (app.candidateId.toString() !== token.uid) {
      return deny(403, "Forbidden");
    }

    const assessment = await AssessmentTemplate.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json({ ok: false, error: "Assessment not found" }, { status: 404 });
    }

    const invitation = await AssessmentInvitation.findOne({
      applicationId: new mongoose.Types.ObjectId(applicationId),
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      candidateId: new mongoose.Types.ObjectId(token.uid),
    });
    if (!invitation) {
      return NextResponse.json(
        { ok: false, error: "Assessment invitation not found" },
        { status: 404 }
      );
    }

    const result = await AssessmentResult.findOneAndUpdate(
      {
        applicationId: new mongoose.Types.ObjectId(applicationId),
        assessmentId: new mongoose.Types.ObjectId(assessmentId),
      },
      {
        $setOnInsert: {
          applicationId: new mongoose.Types.ObjectId(applicationId),
          assessmentId: new mongoose.Types.ObjectId(assessmentId),
        },
        $set: { status: "in_progress", startedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    await AssessmentInvitation.findByIdAndUpdate(invitation._id, {
      $set: { status: "in_progress", startedAt: new Date() },
    });
    await Application.findByIdAndUpdate(applicationId, {
      $set: { status: "assessment_in_progress" },
    });

    await createNotification({
      userId: token.uid as string,
      title: "Assessment started",
      message: "You have started an assessment. Good luck!",
      type: "assessment",
      link: `/candidate/assessments/${assessmentId}`,
    });
    await logAudit({
      req,
      token,
      action: "assessment_started",
      entityType: "Assessment",
      entityId: assessmentId,
      details: { applicationId, assessmentId },
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ? String(e.message) : "Failed to start assessment" },
      { status: 500 }
    );
  }
}

