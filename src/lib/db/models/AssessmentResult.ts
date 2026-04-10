import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IAssessmentResult {
  applicationId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  status: "not_started" | "in_progress" | "completed" | "timed_out";
  answers: Array<{
    questionId: string;
    answer: string;
    score: number;
    feedback: string;
    timeSpent: number;
  }>;
  totalScore: number;
  passed: boolean;
  requiresManualReview: boolean;
  manualReviewStatus: "pending" | "finalized";
  finalScore?: number;
  finalReport?: string;
  finalizedBy?: Types.ObjectId;
  finalizedAt?: Date;
  proctoringLogs: Array<{
    eventType: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
    flagged: boolean;
  }>;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "AssessmentTemplate", required: true, index: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "timed_out"],
      default: "not_started",
      index: true,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, default: "" },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: "" },
        timeSpent: { type: Number, default: 0 },
      },
    ],
    totalScore: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    requiresManualReview: { type: Boolean, default: true, index: true },
    manualReviewStatus: {
      type: String,
      enum: ["pending", "finalized"],
      default: "pending",
      index: true,
    },
    finalScore: { type: Number },
    finalReport: { type: String, default: "" },
    finalizedBy: { type: Schema.Types.ObjectId, ref: "User" },
    finalizedAt: { type: Date },
    proctoringLogs: [
      {
        eventType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: Schema.Types.Mixed, default: {} },
        flagged: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

AssessmentResultSchema.index({ applicationId: 1, assessmentId: 1 }, { unique: true });

export const AssessmentResult: Model<IAssessmentResult> =
  (mongoose.models.AssessmentResult as Model<IAssessmentResult> | undefined) ??
  mongoose.model<IAssessmentResult>("AssessmentResult", AssessmentResultSchema);

