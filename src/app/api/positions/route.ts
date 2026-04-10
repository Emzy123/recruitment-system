import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { Position } from "@/lib/db/models/Position";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { logAudit } from "@/lib/utils/audit";

const CreatePositionSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1).max(120),
  type: z.enum(["full-time", "part-time", "contract"]),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]),
  description: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  location: z.string().min(1).max(200),
  isRemote: z.boolean().default(false),
  postedDate: z.coerce.date(),
  closingDate: z.coerce.date(),
});

function parsePageParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") ?? "12")));
  return { page, limit };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const type = url.searchParams.get("type") ?? undefined;
  const experienceLevel = url.searchParams.get("experienceLevel") ?? undefined;
  const department = url.searchParams.get("department") ?? undefined;
  const isRemoteStr = url.searchParams.get("isRemote") ?? undefined;
  const isRemote = isRemoteStr === undefined ? undefined : isRemoteStr === "true";

  const { page, limit } = parsePageParams(url.searchParams);

  await connectToMongo();

  const filter: any = { isActive: true };
  if (type) filter.type = type;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (department) filter.department = department;
  if (typeof isRemote === "boolean") filter.isRemote = isRemote;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { requiredSkills: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Position.countDocuments(filter);
  const items = await Position.find(filter)
    .sort({ postedDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({
    ok: true,
    page,
    limit,
    total,
    items,
  });
}

export async function POST(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreatePositionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await connectToMongo();

  if (typeof token.uid !== "string") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const created = await Position.create({
    ...parsed.data,
    requirements: parsed.data.requirements ?? [],
    responsibilities: parsed.data.responsibilities ?? [],
    requiredSkills: parsed.data.requiredSkills ?? [],
    preferredSkills: parsed.data.preferredSkills ?? [],
    postedDate: parsed.data.postedDate,
    closingDate: parsed.data.closingDate,
    createdBy: new mongoose.Types.ObjectId(token.uid),
    isActive: true,
  });

  await logAudit({
    req,
    token: token as any,
    action: "position_created",
    entityType: "Position",
    entityId: created._id.toString(),
    details: { department: created.department, title: created.title },
  });

  return NextResponse.json({ ok: true, position: created }, { status: 201 });
}

