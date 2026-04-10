import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { PeerReview } from "@/lib/db/models/PeerReview";

const UpdateSchema = z.object({
  id: z.string().min(1),
  scores: z
    .object({
      technicalSkill: z.number().min(1).max(5),
      problemSolving: z.number().min(1).max(5),
      communication: z.number().min(1).max(5),
      culturalFit: z.number().min(1).max(5),
      overall: z.number().min(1).max(5),
    })
    .optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  comments: z.string().optional(),
  recommendation: z.enum(["strong_hire", "hire", "consider", "not_hire"]).optional(),
});

export async function PUT(req: Request) {
  const token = await getAuthToken(req);
  if (!token || typeof token.uid !== "string") return deny();

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const existing = await PeerReview.findById(parsed.data.id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
  }

  const isOwner = existing.reviewerId.toString() === token.uid;
  const isAdmin = token.role === "admin";
  if (!isOwner && !isAdmin) return deny();

  const updated = await PeerReview.findByIdAndUpdate(
    parsed.data.id,
    { $set: { ...parsed.data, id: undefined } },
    { new: true }
  );
  return NextResponse.json({ ok: true, review: updated });
}

