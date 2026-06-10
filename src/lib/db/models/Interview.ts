import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IInterview {
  applicationId: Types.ObjectId;
  candidateId: Types.ObjectId;
  scheduledAt: Date;
  locationOrLink: string;
  interviewers: Types.ObjectId[];
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  evaluations: Array<{
    interviewerId: Types.ObjectId;
    scores: {
      teachingResearch: number;
      academicVision: number;
      domainDepth: number;
      communication: number;
      culturalFit: number;
    };
    strengths: string;
    weaknesses: string;
    comments: string;
    recommendation: "strong_hire" | "hire" | "consider" | "not_hire";
    submittedAt: Date;
  }>;
}

const InterviewSchema = new Schema<IInterview>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scheduledAt: { type: Date, required: true },
    locationOrLink: { type: String, required: true, default: "" },
    interviewers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    evaluations: [
      {
        interviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        scores: {
          teachingResearch: { type: Number, min: 1, max: 5, required: true },
          academicVision: { type: Number, min: 1, max: 5, required: true },
          domainDepth: { type: Number, min: 1, max: 5, required: true },
          communication: { type: Number, min: 1, max: 5, required: true },
          culturalFit: { type: Number, min: 1, max: 5, required: true },
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
    ],
  },
  { timestamps: true }
);

export const Interview: Model<IInterview> =
  (mongoose.models.Interview as Model<IInterview> | undefined) ??
  mongoose.model<IInterview>("Interview", InterviewSchema);
