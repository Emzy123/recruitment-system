import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "application" | "assessment" | "decision" | "reminder";
  isRead: boolean;
  link: string;
  emailSent: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["application", "assessment", "decision", "reminder"],
      required: true,
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
    emailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification> | undefined) ??
  mongoose.model<INotification>("Notification", NotificationSchema);

