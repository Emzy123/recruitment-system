import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Application } from "@/lib/db/models/Application";
import { HiringDecision } from "@/lib/db/models/HiringDecision";
import { User } from "@/lib/db/models/User";
import { Position } from "@/lib/db/models/Position";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { logAudit } from "@/lib/utils/audit";
import { createNotification } from "@/lib/utils/notifications";
import { sendDecisionEmail } from "@/lib/utils/email";

const DecisionSchema = z.object({
  decision: z.enum(["offer", "reject", "waitlist"]),
  notes: z.string().optional().default(""),
  offerDetails: z
    .object({
      salary: z.number().optional(),
      startDate: z.coerce.date().optional(),
      acceptanceDeadline: z.coerce.date().optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
  context: { params: { applicationId: string } }
) {
  // Prefer shared auth helper (it uses getToken internally).
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();
  if (typeof token.uid !== "string") return deny();

  const body = await req.json().catch(() => null);
  const parsed = DecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();

  const application = await Application.findById(context.params.applicationId);
  if (!application) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Admin can only make a final decision after the committee has submitted their peer review.
  // The committee review route moves status to `admin_decision` — that is the only valid gate.
  if (application.status !== "admin_decision") {
    return NextResponse.json(
      {
        ok: false,
        error:
          application.status === "committee_review"
            ? "Committee has not submitted their peer review yet. Please wait for committee review to complete."
            : `Application is not ready for final decision. Current status: ${application.status}`,
      },
      { status: 400 }
    );
  }

  // Use upsert so admin can revise a decision if needed.
  const decision = await HiringDecision.findOneAndUpdate(
    { applicationId: new mongoose.Types.ObjectId(context.params.applicationId) },
    {
      $set: {
        decision: parsed.data.decision,
        offerDetails: parsed.data.offerDetails ?? null,
        decisionMakerId: new mongoose.Types.ObjectId(token.uid),
        notes: parsed.data.notes,
        decisionDate: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  // Keep application.status in sync with decision outcome.
  let nextStatus: any = "review";
  if (parsed.data.decision === "offer") nextStatus = "offer";
  if (parsed.data.decision === "reject") nextStatus = "rejected";
  if (parsed.data.decision === "waitlist") nextStatus = "waitlist";

  await Application.findByIdAndUpdate(context.params.applicationId, {
    $set: {
      status: nextStatus,
      committeeNotes: parsed.data.notes,
    },
  });

  // Candidate notification.
  const candidateUserId = application.candidateId.toString();
  await createNotification({
    userId: candidateUserId,
    title: "Hiring decision updated",
    message: `A final hiring decision has been made on your application (${parsed.data.decision}).`,
    type: "decision",
    link: `/candidate/applications/${context.params.applicationId}`,
  });

  // Email Notification
  const candidate = await User.findById(application.candidateId);
  const position = await Position.findById(application.positionId);
  if (candidate && candidate.email && position) {
    await sendDecisionEmail({
      to: candidate.email,
      candidateName: candidate.firstName,
      positionTitle: position.title,
      decision: parsed.data.decision,
      offerDetails: parsed.data.offerDetails,
    });
  }

  await logAudit({
    req,
    token,
    action: "decision_submitted",
    entityType: "Application",
    entityId: context.params.applicationId,
    details: { decision: parsed.data.decision },
  });

  return NextResponse.json({ ok: true, decision });
}

export async function GET(
  req: Request,
  context: { params: { applicationId: string } }
) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  await connectToMongo();
  const decision = await HiringDecision.findOne({
    applicationId: new mongoose.Types.ObjectId(context.params.applicationId),
  });

  if (!decision) {
    return NextResponse.json({ ok: false, error: "No decision found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, decision });
}


