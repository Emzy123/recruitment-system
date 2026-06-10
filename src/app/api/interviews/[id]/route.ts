import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Interview } from "@/lib/db/models/Interview";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";
import { createNotification } from "@/lib/utils/notifications";

const UpdateInterviewSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  locationOrLink: z.string().min(1).optional(),
  interviewers: z.array(z.string().min(1)).optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getAuthToken(req);
  if (!token) {
    return deny(401, "Unauthorized");
  }

  await connectToMongo();

  const interview = await Interview.findById(context.params.id)
    .populate("interviewers", "firstName lastName email role")
    .populate("candidateId", "firstName lastName email");

  if (!interview) {
    return NextResponse.json({ ok: false, error: "Interview not found" }, { status: 404 });
  }

  const isOwner = token.role === "candidate" && interview.candidateId.toString() === token.uid;
  const isStaff = hasAnyRole(token.role as string, ["admin", "committee", "assessor"]);

  if (!isOwner && !isStaff) {
    return deny();
  }

  return NextResponse.json({ ok: true, interview });
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["admin", "committee"])) {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();

  const interview = await Interview.findById(context.params.id);
  if (!interview) {
    return NextResponse.json({ ok: false, error: "Interview not found" }, { status: 404 });
  }

  const updateData: any = {};
  if (parsed.data.scheduledAt !== undefined) updateData.scheduledAt = parsed.data.scheduledAt;
  if (parsed.data.locationOrLink !== undefined) updateData.locationOrLink = parsed.data.locationOrLink;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.interviewers !== undefined) {
    updateData.interviewers = parsed.data.interviewers.map((id) => new mongoose.Types.ObjectId(id));
  }

  const updated = await Interview.findByIdAndUpdate(
    context.params.id,
    { $set: updateData },
    { new: true }
  ).populate("interviewers", "firstName lastName email role");

  // Send reschedule/cancel notification to the candidate if applicable
  if (parsed.data.scheduledAt !== undefined || parsed.data.status === "cancelled") {
    const title = parsed.data.status === "cancelled" ? "Interview Cancelled" : "Interview Rescheduled";
    const message =
      parsed.data.status === "cancelled"
        ? "Your panel interview has been cancelled."
        : `Your panel interview has been rescheduled for ${new Date(parsed.data.scheduledAt!).toLocaleString()}.`;

    await createNotification({
      userId: interview.candidateId.toString(),
      title,
      message,
      type: "application",
      link: `/candidate/applications/${interview.applicationId}`,
    });
  }

  return NextResponse.json({ ok: true, interview: updated });
}
