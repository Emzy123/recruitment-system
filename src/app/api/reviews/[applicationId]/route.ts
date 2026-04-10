import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { PeerReview } from "@/lib/db/models/PeerReview";
import { Application } from "@/lib/db/models/Application";
import { logAudit } from "@/lib/utils/audit";
import { createNotification } from "@/lib/utils/notifications";

const ReviewSchema = z.object({
  scores: z.object({
    technicalSkill: z.number().min(1).max(5),
    problemSolving: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    culturalFit: z.number().min(1).max(5),
    overall: z.number().min(1).max(5),
  }),
  strengths: z.string().default(""),
  weaknesses: z.string().default(""),
  comments: z.string().default(""),
  recommendation: z.enum(["strong_hire", "hire", "consider", "not_hire"]),
});

export async function POST(req: Request, context: { params: { applicationId: string } }) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "committee" || typeof token.uid !== "string") {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const application = await Application.findById(context.params.applicationId);
  if (!application) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }
  if (!["committee_review", "review"].includes(application.status)) {
    return NextResponse.json(
      { ok: false, error: `Application is not in committee phase (current: ${application.status})` },
      { status: 400 }
    );
  }

  const existing = await PeerReview.findOne({
    applicationId: new mongoose.Types.ObjectId(context.params.applicationId),
    reviewerId: new mongoose.Types.ObjectId(token.uid),
  });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Reviewer already submitted review" }, { status: 409 });
  }

  const review = await PeerReview.create({
    applicationId: new mongoose.Types.ObjectId(context.params.applicationId),
    reviewerId: new mongoose.Types.ObjectId(token.uid),
    ...parsed.data,
    submittedAt: new Date(),
  });

  await Application.findByIdAndUpdate(context.params.applicationId, {
    $set: { status: "admin_decision" },
  });

  // Candidate notification + audit trail.
  if (application) {
    await createNotification({
      userId: application.candidateId.toString(),
      title: "Review submitted",
      message: "A hiring committee review has been submitted for your application.",
      type: "application",
      link: `/candidate/applications/${context.params.applicationId}`,
    });
  }
  await logAudit({
    req,
    token,
    action: "peer_review_submitted",
    entityType: "PeerReview",
    entityId: review._id.toString(),
    details: { recommendation: parsed.data.recommendation },
  });

  return NextResponse.json({ ok: true, review }, { status: 201 });
}

export async function GET(req: Request, context: { params: { applicationId: string } }) {
  const token = await getAuthToken(req);
  if (!token || (token.role !== "committee" && token.role !== "admin")) return deny();

  await connectToMongo();
  const items = await PeerReview.find({
    applicationId: new mongoose.Types.ObjectId(context.params.applicationId),
  }).populate("reviewerId", "firstName lastName email");

  return NextResponse.json({ ok: true, items });
}

