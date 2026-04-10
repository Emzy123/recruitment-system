import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { AssessmentResult } from "@/lib/db/models/AssessmentResult";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { Application } from "@/lib/db/models/Application";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { User } from "@/lib/db/models/User";
import { createNotification, createNotificationsBulk } from "@/lib/utils/notifications";
import { logAudit } from "@/lib/utils/audit";

const FinalizeSchema = z.object({
  applicationId: z.string().min(1),
  finalScore: z.number().min(0),
  finalReport: z.string().min(1).max(10000),
});

export async function POST(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "assessor" || typeof token.uid !== "string") {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = FinalizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();

  const assessmentId = new mongoose.Types.ObjectId(context.params.id);
  const applicationId = new mongoose.Types.ObjectId(parsed.data.applicationId);

  const template = await AssessmentTemplate.findById(assessmentId);
  if (!template) {
    return NextResponse.json({ ok: false, error: "Assessment not found" }, { status: 404 });
  }

  const result = await AssessmentResult.findOne({
    assessmentId,
    applicationId,
  });
  if (!result) {
    return NextResponse.json({ ok: false, error: "Assessment result not found" }, { status: 404 });
  }

  const passed = parsed.data.finalScore >= template.passingScore;
  result.finalScore = parsed.data.finalScore;
  result.finalReport = parsed.data.finalReport;
  result.finalizedBy = new mongoose.Types.ObjectId(token.uid);
  result.finalizedAt = new Date();
  result.manualReviewStatus = "finalized";
  result.requiresManualReview = false;
  result.passed = passed;
  await result.save();

  await AssessmentInvitation.findOneAndUpdate(
    { assessmentId, applicationId },
    {
      $set: {
        status: "finalized",
      },
    }
  );

  await Application.findByIdAndUpdate(applicationId, {
    $set: {
      status: "committee_review",
    },
  });

  const app = await Application.findById(applicationId);
  if (app) {
    await createNotification({
      userId: app.candidateId.toString(),
      title: "Assessment finalized",
      message: "Your technical assessment has been finalized and moved to committee review.",
      type: "assessment",
      link: `/candidate/applications/${app._id.toString()}`,
    });
  }

  const committees = await User.find({ role: "committee", isActive: true }).select("_id");
  await createNotificationsBulk(
    committees.map((u) => ({
      userId: u._id.toString(),
      title: "Application ready for peer review",
      message: "An assessor finalized technical review. Committee peer review is now required.",
      type: "application" as const,
      link: `/committee/applications/${parsed.data.applicationId}`,
    }))
  );

  await logAudit({
    req,
    token,
    action: "assessment_finalized_by_assessor",
    entityType: "AssessmentResult",
    entityId: result._id.toString(),
    details: { finalScore: parsed.data.finalScore, passed },
  });

  return NextResponse.json({ ok: true, result });
}

