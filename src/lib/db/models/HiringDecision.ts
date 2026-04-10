import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IHiringDecision {
  applicationId: Types.ObjectId;
  decision: "offer" | "reject" | "waitlist";
  offerDetails?: {
    salary?: number;
    startDate?: Date;
    acceptanceDeadline?: Date;
  };
  decisionMakerId: Types.ObjectId;
  notes: string;
  decisionDate: Date;
  acceptanceDate?: Date;
}

const HiringDecisionSchema = new Schema<IHiringDecision>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },
    decision: { type: String, enum: ["offer", "reject", "waitlist"], required: true },
    offerDetails: {
      salary: { type: Number },
      startDate: { type: Date },
      acceptanceDeadline: { type: Date },
    },
    decisionMakerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
    decisionDate: { type: Date, default: Date.now },
    acceptanceDate: { type: Date },
  },
  { timestamps: true }
);

export const HiringDecision: Model<IHiringDecision> =
  (mongoose.models.HiringDecision as Model<IHiringDecision> | undefined) ??
  mongoose.model<IHiringDecision>("HiringDecision", HiringDecisionSchema);

