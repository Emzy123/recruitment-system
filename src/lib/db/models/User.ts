import mongoose, { Schema, type Model } from "mongoose";

export type UserRole = "candidate" | "committee" | "assessor" | "admin";

export interface IUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  emailVerified: boolean;
  lastLogin?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["candidate", "committee", "assessor", "admin"],
      required: true,
      default: "candidate",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    passwordResetTokenHash: { type: String, default: "" },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser> | undefined) ??
  mongoose.model<IUser>("User", UserSchema);

