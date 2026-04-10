import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Position } from "@/lib/db/models/Position";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { logAudit } from "@/lib/utils/audit";

const UpdatePositionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  department: z.string().min(1).max(120).optional(),
  type: z.enum(["full-time", "part-time", "contract"]).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  location: z.string().min(1).max(200).optional(),
  isRemote: z.boolean().optional(),
  postedDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  await connectToMongo();

  const position = await Position.findOne({ _id: id, isActive: true });
  if (!position) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await Position.updateOne({ _id: id }, { $inc: { viewCount: 1 } });

  return NextResponse.json({ ok: true, position });
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

  const { id } = context.params;
  const body = await req.json().catch(() => null);
  const parsed = UpdatePositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  const updated = await Position.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    {
      $set: {
        ...parsed.data,
        salaryMin: parsed.data.salaryMin ?? undefined,
        salaryMax: parsed.data.salaryMax ?? undefined,
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
    action: "position_updated",
    entityType: "Position",
    entityId: updated._id.toString(),
    details: { department: updated.department, title: updated.title },
  });

  return NextResponse.json({ ok: true, position: updated }, { status: 200 });
}

export async function DELETE(
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

  const { id } = context.params;
  await connectToMongo();

  const deleted = await Position.findByIdAndUpdate(
    new mongoose.Types.ObjectId(id),
    { $set: { isActive: false } },
    { new: true }
  );

  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await logAudit({
    req,
    token: token as any,
    action: "position_deactivated",
    entityType: "Position",
    entityId: deleted._id.toString(),
    details: { department: deleted.department, title: deleted.title },
  });

  return NextResponse.json({ ok: true });
}

