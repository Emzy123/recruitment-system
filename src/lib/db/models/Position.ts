import mongoose, { Schema, type Model, type Types } from "mongoose";

export type PositionType = "full-time" | "part-time" | "contract";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";

export interface IPosition {
  title: string;
  department: string;
  type: PositionType;
  experienceLevel: ExperienceLevel;
  description: string;
  requirements: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  isRemote: boolean;
  isActive: boolean;
  postedDate: Date;
  closingDate: Date;
  createdBy: Types.ObjectId;
  viewCount: number;
}

const PositionSchema = new Schema<IPosition>(
  {
    title: { type: String, required: true, trim: true, index: true },
    department: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      required: true,
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    salaryMin: { type: Number, default: undefined },
    salaryMax: { type: Number, default: undefined },
    location: { type: String, required: true, trim: true },
    isRemote: { type: Boolean, required: true, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    postedDate: { type: Date, required: true, index: true },
    closingDate: { type: Date, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

PositionSchema.index({ title: "text", department: "text" });

export const Position: Model<IPosition> =
  (mongoose.models.Position as Model<IPosition> | undefined) ??
  mongoose.model<IPosition>("Position", PositionSchema);

