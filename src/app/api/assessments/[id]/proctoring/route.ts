import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { ProctoringEvent } from "@/lib/db/models/ProctoringEvent";
import { Application } from "@/lib/db/models/Application";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "candidate") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const candidateId = token.uid;
  if (!candidateId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const assessmentId = params.id;
  const body = await req.json().catch(() => null);
  const applicationId = body?.applicationId;
  const eventType = body?.eventType;

  if (!applicationId || !eventType) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  await connectToMongo();

  // Ensure application belongs to this candidate
  const app = await Application.findOne({
    _id: new mongoose.Types.ObjectId(applicationId),
    candidateId: new mongoose.Types.ObjectId(candidateId),
  });

  if (!app) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  const event = await ProctoringEvent.create({
    applicationId: app._id,
    candidateId: app.candidateId,
    assessmentId: new mongoose.Types.ObjectId(assessmentId),
    eventType,
    timestamp: new Date(),
  });

  return NextResponse.json({ ok: true, event });
}
