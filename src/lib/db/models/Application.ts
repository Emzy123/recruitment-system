import mongoose, { Schema, type Model, type Types } from "mongoose";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "assessment_invited"
  | "assessment_in_progress"
  | "assessment_completed"
  | "committee_review"
  | "admin_decision"
  | "screening"
  | "assessment"
  | "interview"
  | "review"
  | "offer"
  | "waitlist"
  | "hired"
  | "rejected";

export interface IApplication {
  candidateId: Types.ObjectId;
  positionId: Types.ObjectId;
  status: ApplicationStatus;
  coverLetter: string;
  resumeUrl?: string;
  submittedAt?: Date;
  committeeNotes?: string;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true, index: true },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "assessment_invited",
        "assessment_in_progress",
        "assessment_completed",
        "committee_review",
        "admin_decision",
        "screening",
        "assessment",
        "interview",
        "review",
        "offer",
        "waitlist",
        "hired",
        "rejected",
      ],
      default: "draft",
      index: true,
    },
    coverLetter: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    submittedAt: { type: Date },
    committeeNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ candidateId: 1, positionId: 1 }, { unique: true });

export const Application: Model<IApplication> =
  (mongoose.models.Application as Model<IApplication> | undefined) ??
  mongoose.model<IApplication>("Application", ApplicationSchema);

