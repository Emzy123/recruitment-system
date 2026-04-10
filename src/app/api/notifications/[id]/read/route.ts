import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Notification } from "@/lib/db/models/Notification";

export async function PUT(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || typeof token.uid !== "string") return deny(401, "Unauthorized");

  await connectToMongo();
  const updated = await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(context.params.id),
      userId: new mongoose.Types.ObjectId(token.uid),
    },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, notification: updated });
}

