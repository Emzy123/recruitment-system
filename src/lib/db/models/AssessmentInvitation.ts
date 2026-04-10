import mongoose, { Schema, type Model, type Types } from "mongoose";

export type AssessmentInvitationStatus =
  | "invited"
  | "in_progress"
  | "submitted"
  | "finalized"
  | "expired";

export interface IAssessmentInvitation {
  applicationId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  candidateId: Types.ObjectId;
  invitedAt: Date;
  startedAt?: Date;
  submittedAt?: Date;
  dueAt?: Date;
  status: AssessmentInvitationStatus;
}

const AssessmentInvitationSchema = new Schema<IAssessmentInvitation>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "AssessmentTemplate", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    invitedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    dueAt: { type: Date },
    status: {
      type: String,
      enum: ["invited", "in_progress", "submitted", "finalized", "expired"],
      default: "invited",
      index: true,
    },
  },
  { timestamps: true }
);

AssessmentInvitationSchema.index(
  { applicationId: 1, assessmentId: 1, candidateId: 1 },
  { unique: true }
);

export const AssessmentInvitation: Model<IAssessmentInvitation> =
  (mongoose.models.AssessmentInvitation as Model<IAssessmentInvitation> | undefined) ??
  mongoose.model<IAssessmentInvitation>("AssessmentInvitation", AssessmentInvitationSchema);

