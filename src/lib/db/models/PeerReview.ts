import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IPeerReview {
  applicationId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  scores: {
    technicalSkill: number;
    problemSolving: number;
    communication: number;
    culturalFit: number;
    overall: number;
  };
  strengths: string;
  weaknesses: string;
  comments: string;
  recommendation: "strong_hire" | "hire" | "consider" | "not_hire";
  submittedAt: Date;
}

const PeerReviewSchema = new Schema<IPeerReview>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scores: {
      technicalSkill: { type: Number, min: 1, max: 5, required: true },
      problemSolving: { type: Number, min: 1, max: 5, required: true },
      communication: { type: Number, min: 1, max: 5, required: true },
      culturalFit: { type: Number, min: 1, max: 5, required: true },
      overall: { type: Number, min: 1, max: 5, required: true },
    },
    strengths: { type: String, default: "" },
    weaknesses: { type: String, default: "" },
    comments: { type: String, default: "" },
    recommendation: {
      type: String,
      enum: ["strong_hire", "hire", "consider", "not_hire"],
      required: true,
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PeerReviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });

export const PeerReview: Model<IPeerReview> =
  (mongoose.models.PeerReview as Model<IPeerReview> | undefined) ??
  mongoose.model<IPeerReview>("PeerReview", PeerReviewSchema);

