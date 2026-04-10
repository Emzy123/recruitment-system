import { NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { Application } from "@/lib/db/models/Application";
import { logAudit } from "@/lib/utils/audit";

const UpdateApplicationSchema = z.object({
  status: z
    .enum([
      "draft",
      "submitted",
      "assessment_invited",
      "assessment_in_progress",
      "assessment_completed",
      "committee_review",
      "admin_decision",
      "screening",
      "assessment",
      "interview",
      "review",
      "offer",
      "waitlist",
      "hired",
      "rejected",
    ])
    .optional(),
  committeeNotes: z.string().optional(),
});

const ALLOWED_ADMIN_TRANSITIONS: Record<string, string[]> = {
  submitted: ["screening", "assessment_invited"],
  assessment_invited: ["assessment_in_progress", "screening"],
  assessment_in_progress: ["assessment_completed"],
  assessment_completed: ["committee_review"],
  committee_review: ["admin_decision", "interview"],
  admin_decision: ["offer", "waitlist", "rejected"],
  screening: ["assessment_invited", "interview"],
  interview: ["admin_decision"],
  review: ["admin_decision"],
};

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToMongo();

  const application = await Application.findById(context.params.id);

  if (!application) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const isOwner =
    token.role === "candidate" &&
    typeof token.uid === "string" &&
    application.candidateId.toString() === token.uid;

  const isStaff = token.role === "committee" || token.role === "admin" || token.role === "assessor";

  if (!isOwner && !isStaff) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await application.populate("candidateId", "firstName lastName email role");
  await application.populate(
    "positionId",
    "title department location type experienceLevel description"
  );

  return NextResponse.json({ ok: true, application });
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  const current = await Application.findById(new mongoose.Types.ObjectId(context.params.id));
  if (!current) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (parsed.data.status) {
    const allowedNext = ALLOWED_ADMIN_TRANSITIONS[current.status] ?? [];
    if (!allowedNext.includes(parsed.data.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid transition from ${current.status} to ${parsed.data.status}`,
        },
        { status: 400 }
      );
    }
  }

  const updated = await Application.findByIdAndUpdate(
    new mongoose.Types.ObjectId(context.params.id),
    {
      $set: {
        ...(parsed.data.status ? { status: parsed.data.status } : null),
        ...(parsed.data.committeeNotes !== undefined
          ? { committeeNotes: parsed.data.committeeNotes }
          : null),
        ...(parsed.data.status === "submitted"
          ? { submittedAt: new Date() }
          : null),
      },
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await logAudit({
    req,
    token: token as any,
    action: "application_status_updated",
    entityType: "Application",
    entityId: updated._id.toString(),
    details: { status: updated.status },
  });

  return NextResponse.json({ ok: true, application: updated });
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token || token.role !== "candidate") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  await connectToMongo();

  const application = await Application.findById(context.params.id);
  if (!application) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (typeof token.uid !== "string" || application.candidateId.toString() !== token.uid) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  if (application.status !== "draft") {
    return NextResponse.json(
      { ok: false, error: "Only draft applications can be deleted" },
      { status: 400 }
    );
  }

  await application.deleteOne();

  await logAudit({
    req,
    token: token as any,
    action: "application_deleted",
    entityType: "Application",
    entityId: application._id.toString(),
    details: { status: application.status },
  });

  return NextResponse.json({ ok: true });
}

