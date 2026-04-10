import mongoose, { Schema, type Model, type Types } from "mongoose";

interface SkillItem {
  name: string;
  proficiency: number;
}

interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
}

interface ExperienceItem {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface ICandidateProfile {
  userId: Types.ObjectId;
  dateOfBirth?: Date;
  location?: string;
  currentEmployer?: string;
  yearsOfExperience?: number;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  coverLetter?: string;
  skills: SkillItem[];
  education: EducationItem[];
  experience: ExperienceItem[];
}

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dateOfBirth: { type: Date },
    location: { type: String, default: "" },
    currentEmployer: { type: String, default: "" },
    yearsOfExperience: { type: Number, default: 0 },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    skills: [
      {
        name: { type: String, required: true },
        proficiency: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        field: { type: String, required: true },
        institution: { type: String, required: true },
        graduationYear: { type: Number, required: true },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const CandidateProfile: Model<ICandidateProfile> =
  (mongoose.models.CandidateProfile as Model<ICandidateProfile> | undefined) ??
  mongoose.model<ICandidateProfile>("CandidateProfile", CandidateProfileSchema);

