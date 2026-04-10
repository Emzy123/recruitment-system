import { Notification } from "@/lib/db/models/Notification";
import { connectToMongo } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: "application" | "assessment" | "decision" | "reminder";
  link: string;
}) {
  const { userId, title, message, type, link } = params;
  await connectToMongo();
  await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    title,
    message,
    type,
    isRead: false,
    link,
    emailSent: false,
  });
}

export async function createNotificationsBulk(
  params: Array<{
    userId: string;
    title: string;
    message: string;
    type: "application" | "assessment" | "decision" | "reminder";
    link: string;
  }>
) {
  if (!params.length) return;
  await connectToMongo();
  await Notification.insertMany(
    params.map((p) => ({
      userId: new mongoose.Types.ObjectId(p.userId),
      title: p.title,
      message: p.message,
      type: p.type,
      isRead: false,
      link: p.link,
      emailSent: false,
    }))
  );
}

