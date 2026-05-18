import { NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { Application } from "@/lib/db/models/Application";
import { Position } from "@/lib/db/models/Position";
import { User } from "@/lib/db/models/User";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { logAudit } from "@/lib/utils/audit";
import { createNotification, createNotificationsBulk } from "@/lib/utils/notifications";
import { sendAssessmentInvitationEmail } from "@/lib/utils/email";
import { withErrorHandler } from "@/lib/utils/api-handler";

const CreateApplicationSchema = z.object({
  positionId: z.string().min(1),
  coverLetter: z.string().min(1).max(20000),
  // For this initial version we accept a URL. File uploads will be added next.
  resumeUrl: z.string().optional(),
});

function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limitStr = searchParams.get("limit");
  // Allow fetching up to 1000 items for full pipeline views
  const limit = Math.max(1, Math.min(1000, Number(limitStr ?? "12")));
  return { page, limit };
}

export const POST = withErrorHandler(async (req: Request) => {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token || token.role !== "candidate") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  const candidateId = token.uid;
  if (typeof candidateId !== "string") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const positionId = parsed.data.positionId;

  const position = await Position.findOne({ _id: new mongoose.Types.ObjectId(positionId), isActive: true });
  if (!position) {
    return NextResponse.json({ ok: false, error: "Invalid position" }, { status: 404 });
  }

  const existing = await Application.findOne({
    candidateId: new mongoose.Types.ObjectId(candidateId),
    positionId: new mongoose.Types.ObjectId(positionId),
  });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "You already applied to this position." },
      { status: 409 }
    );
  }

  const created = await Application.create({
    candidateId: new mongoose.Types.ObjectId(candidateId),
    positionId: new mongoose.Types.ObjectId(positionId),
    status: "submitted",
    coverLetter: parsed.data.coverLetter,
    resumeUrl: parsed.data.resumeUrl ?? "",
    submittedAt: new Date(),
  });

  await createNotification({
    userId: candidateId,
    title: "Application submitted",
    message: `Your application for ${position.title ?? "this position"} has been submitted.`,
    type: "application",
    link: `/candidate/applications/${created._id.toString()}`,
  });

  // Auto-create assessment invitation for the position's active template.
  const template = await AssessmentTemplate.findOne({
    positionId: new mongoose.Types.ObjectId(positionId),
    isActive: true,
  }).sort({ createdAt: -1 });

  if (template) {
    await AssessmentInvitation.findOneAndUpdate(
      {
        applicationId: created._id,
        assessmentId: template._id,
        candidateId: created.candidateId,
      },
      {
        $setOnInsert: {
          applicationId: created._id,
          assessmentId: template._id,
          candidateId: created.candidateId,
          invitedAt: new Date(),
        },
        $set: {
          status: "invited",
        },
      },
      { upsert: true, new: true }
    );

    await Application.findByIdAndUpdate(created._id, {
      $set: { status: "assessment_invited" },
    });

    await createNotification({
      userId: candidateId,
      title: "Assessment invitation sent",
      message: `You've been invited to complete the assessment for ${position.title ?? "this position"}.`,
      type: "assessment",
      link: `/candidate/assessments/${template._id.toString()}`,
    });

    const candidateUser = await User.findById(candidateId).select("email firstName");
    if (candidateUser && candidateUser.email) {
      const appUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";
      const assessmentUrl = `${appUrl}/candidate/assessments/${template._id.toString()}`;
      
      await sendAssessmentInvitationEmail({
        to: candidateUser.email,
        candidateName: candidateUser.firstName,
        positionTitle: position.title,
        assessmentUrl,
      });
    }

    const assessors = await User.find({ role: "assessor", isActive: true }).select("_id");
    await createNotificationsBulk(
      assessors.map((u) => ({
        userId: u._id.toString(),
        title: "New application needs technical review",
        message: `A candidate applied for ${position.title ?? "a position"} and was auto-invited to assessment.`,
        type: "application" as const,
        link: `/assessor`,
      }))
    );
  }
  await logAudit({
    req,
    token: token as any,
    action: "application_submitted",
    entityType: "Application",
    entityId: created._id.toString(),
    details: { positionId: positionId },
  });

  return NextResponse.json({ ok: true, application: created }, { status: 201 });
});

export const GET = withErrorHandler(async (req: Request) => {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const positionId = url.searchParams.get("positionId") ?? undefined;
  const { page, limit } = getPagination(url.searchParams);

  await connectToMongo();

  const filter: any = {};
  if (token.role === "candidate") {
    if (typeof token.uid !== "string") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    filter.candidateId = new mongoose.Types.ObjectId(token.uid);
  }
  if (token.role !== "candidate") {
    // committee/admin/assessor can see all (committee should likely see assigned, but keep simple)
  }

  if (status) filter.status = status;
  if (positionId) filter.positionId = new mongoose.Types.ObjectId(positionId);

  const total = await Application.countDocuments(filter);
  const items = await Application.find(filter)
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("candidateId", "firstName lastName email role")
    .populate("positionId", "title department location type experienceLevel");

  return NextResponse.json({ ok: true, page, limit, total, items });
});

