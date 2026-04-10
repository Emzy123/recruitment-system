import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { AuditLog } from "@/lib/db/models/AuditLog";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const action = url.searchParams.get("action");
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? "25")));

  await connectToMongo();

  const filter: any = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;

  const total = await AuditLog.countDocuments(filter);
  const items = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ ok: true, page, limit, total, items });
}

