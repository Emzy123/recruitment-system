import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Notification } from "@/lib/db/models/Notification";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || typeof token.uid !== "string") return deny(401, "Unauthorized");

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? "20")));

  await connectToMongo();
  const filter: any = { userId: new mongoose.Types.ObjectId(token.uid) };
  if (unreadOnly) filter.isRead = false;

  const total = await Notification.countDocuments(filter);
  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({ ok: true, page, limit, total, items });
}

