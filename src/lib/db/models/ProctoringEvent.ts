import mongoose, { Schema, type Model } from "mongoose";

export interface IProctoringEvent {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  eventType: string;
  timestamp: Date;
}

const ProctoringEventSchema = new Schema<IProctoringEvent>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "AssessmentTemplate", required: true, index: true },
    eventType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProctoringEvent: Model<IProctoringEvent> =
  (mongoose.models.ProctoringEvent as Model<IProctoringEvent> | undefined) ??
  mongoose.model<IProctoringEvent>("ProctoringEvent", ProctoringEventSchema);
