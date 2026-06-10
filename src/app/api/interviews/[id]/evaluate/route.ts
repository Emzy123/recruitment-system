import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Interview } from "@/lib/db/models/Interview";
import { Application } from "@/lib/db/models/Application";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";

const EvaluateInterviewSchema = z.object({
  scores: z.object({
    teachingResearch: z.number().min(1).max(5),
    academicVision: z.number().min(1).max(5),
    domainDepth: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    culturalFit: z.number().min(1).max(5),
  }),
  strengths: z.string().optional().default(""),
  weaknesses: z.string().optional().default(""),
  comments: z.string().optional().default(""),
  recommendation: z.enum(["strong_hire", "hire", "consider", "not_hire"]),
});

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["admin", "committee"])) {
    return deny();
  }
  if (typeof token.uid !== "string") {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = EvaluateInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();

  const interview = await Interview.findById(context.params.id);
  if (!interview) {
    return NextResponse.json({ ok: false, error: "Interview not found" }, { status: 404 });
  }

  // Ensure the current user is one of the assigned interviewers
  const isAssigned = interview.interviewers.some(
    (id) => id.toString() === token.uid
  );
  if (!isAssigned) {
    return deny(403, "You are not assigned as an interviewer for this panel");
  }

  // Check if user has already evaluated, if so overwrite; otherwise push
  const index = interview.evaluations.findIndex(
    (e: any) => e.interviewerId.toString() === token.uid
  );

  const evalDoc = {
    interviewerId: new mongoose.Types.ObjectId(token.uid),
    scores: parsed.data.scores,
    strengths: parsed.data.strengths,
    weaknesses: parsed.data.weaknesses,
    comments: parsed.data.comments,
    recommendation: parsed.data.recommendation,
    submittedAt: new Date(),
  };

  if (index > -1) {
    interview.evaluations[index] = evalDoc as any;
  } else {
    interview.evaluations.push(evalDoc as any);
  }

  // Check if all assigned interviewers have evaluated
  if (interview.evaluations.length >= interview.interviewers.length) {
    interview.status = "completed";

    // Auto-advance application state to 'admin_decision'
    await Application.findByIdAndUpdate(interview.applicationId, {
      $set: { status: "admin_decision" },
    });
  }

  await interview.save();

  return NextResponse.json({ ok: true, interview });
}
