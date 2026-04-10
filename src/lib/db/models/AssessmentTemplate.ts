import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IAssessmentTemplate {
  positionId: Types.ObjectId;
  title: string;
  description: string;
  type: "coding" | "multiple_choice" | "essay";
  durationMinutes: number;
  passingScore: number;
  instructions: string;
  isActive: boolean;
  questions: Array<{
    title: string;
    description: string;
    type: "coding" | "multiple_choice" | "essay";
    points: number;
    order: number;
    programmingLanguage?: string;
    starterCode?: string;
    testCases?: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
    }>;
    options?: string[];
    correctAnswer?: string;
    rubric?: Record<string, unknown>;
  }>;
}

const AssessmentTemplateSchema = new Schema<IAssessmentTemplate>(
  {
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["coding", "multiple_choice", "essay"],
      required: true,
      index: true,
    },
    durationMinutes: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    instructions: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    questions: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: {
          type: String,
          enum: ["coding", "multiple_choice", "essay"],
          required: true,
        },
        points: { type: Number, required: true },
        order: { type: Number, required: true },
        programmingLanguage: { type: String, default: "" },
        starterCode: { type: String, default: "" },
        testCases: [
          {
            input: { type: String, required: true },
            expectedOutput: { type: String, required: true },
            isHidden: { type: Boolean, default: false },
          },
        ],
        options: [{ type: String }],
        correctAnswer: { type: String, default: "" },
        rubric: { type: Schema.Types.Mixed, default: {} },
      },
    ],
  },
  { timestamps: true }
);

export const AssessmentTemplate: Model<IAssessmentTemplate> =
  (mongoose.models.AssessmentTemplate as Model<IAssessmentTemplate> | undefined) ??
  mongoose.model<IAssessmentTemplate>("AssessmentTemplate", AssessmentTemplateSchema);

