import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { connectToMongo } from "@/lib/mongodb";
import { CandidateProfile } from "@/lib/db/models/CandidateProfile";
import { logAudit } from "@/lib/utils/audit";

const ProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  location: z.string().optional().default(""),
  currentEmployer: z.string().optional().default(""),
  yearsOfExperience: z.number().optional().default(0),
  linkedin: z.string().optional().default(""),
  github: z.string().optional().default(""),
  resumeUrl: z.string().optional().default(""),
  coverLetter: z.string().optional().default(""),
  skills: z
    .array(
      z.object({
        name: z.string().min(1),
        proficiency: z.number().min(1).max(5),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().min(1),
        field: z.string().min(1),
        institution: z.string().min(1),
        graduationYear: z.number().min(1900).max(2100),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string().min(1),
        company: z.string().min(1),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        description: z.string().min(1),
      })
    )
    .optional(),
});

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "candidate" || typeof token.uid !== "string") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectToMongo();

  const profile = await CandidateProfile.findOne({ userId: new mongoose.Types.ObjectId(token.uid) });
  return NextResponse.json({ ok: true, profile });
}

export async function PUT(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "candidate" || typeof token.uid !== "string") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();

  const userId = new mongoose.Types.ObjectId(token.uid);
  const upsert = await CandidateProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...parsed.data,
      },
    },
    { upsert: true, new: true }
  );

  await logAudit({
    req,
    token,
    action: "profile_updated",
    entityType: "CandidateProfile",
    entityId: userId.toString(),
    details: { fields: Object.keys(parsed.data) },
  });

  return NextResponse.json({ ok: true, profile: upsert });
}

