import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Interview } from "@/lib/db/models/Interview";
import { Application } from "@/lib/db/models/Application";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";
import { createNotification } from "@/lib/utils/notifications";

const CreateInterviewSchema = z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  locationOrLink: z.string().min(1),
  interviewers: z.array(z.string().min(1)).min(1),
  notes: z.string().optional().default(""),
});

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["admin", "committee"])) {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, scheduledAt, locationOrLink, interviewers, notes } = parsed.data;

  await connectToMongo();

  const application = await Application.findById(applicationId);
  if (!application) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  // Upsert the interview record for this application
  const interview = await Interview.findOneAndUpdate(
    { applicationId: new mongoose.Types.ObjectId(applicationId) },
    {
      $set: {
        candidateId: application.candidateId,
        scheduledAt,
        locationOrLink,
        interviewers: interviewers.map((id) => new mongoose.Types.ObjectId(id)),
        notes,
        status: "scheduled",
      },
    },
    { upsert: true, new: true }
  );

  // Transition the application status to 'interview'
  await Application.findByIdAndUpdate(applicationId, {
    $set: { status: "interview" },
  });

  // Notify the candidate
  await createNotification({
    userId: application.candidateId.toString(),
    title: "Interview Scheduled",
    message: `Your panel interview has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
    type: "application",
    link: `/candidate/applications/${applicationId}`,
  });

  return NextResponse.json({ ok: true, interview }, { status: 201 });
}

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token) {
    return deny(401, "Unauthorized");
  }

  const url = new URL(req.url);
  const applicationId = url.searchParams.get("applicationId");

  await connectToMongo();

  const filter: any = {};
  if (applicationId) {
    filter.applicationId = new mongoose.Types.ObjectId(applicationId);
  }

  if (token.role === "candidate") {
    // Candidates can only see their own interviews
    filter.candidateId = new mongoose.Types.ObjectId(token.uid as string);
  }

  const items = await Interview.find(filter)
    .populate("interviewers", "firstName lastName email role")
    .populate("candidateId", "firstName lastName email")
    .sort({ scheduledAt: -1 });

  return NextResponse.json({ ok: true, items });
}
