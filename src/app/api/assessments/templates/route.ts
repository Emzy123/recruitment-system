import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";

const TemplateSchema = z.object({
  positionId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["coding", "multiple_choice", "essay"]),
  durationMinutes: z.number().min(1),
  passingScore: z.number().min(0),
  instructions: z.string().default(""),
  isActive: z.boolean().default(true),
  questions: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(["coding", "multiple_choice", "essay"]),
      points: z.number().min(0),
      order: z.number().min(1),
      programmingLanguage: z.string().optional(),
      starterCode: z.string().optional(),
      testCases: z
        .array(
          z.object({
            input: z.string(),
            expectedOutput: z.string(),
            isHidden: z.boolean().default(false),
          })
        )
        .optional(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
      rubric: z.record(z.any()).optional(),
    })
  ),
});

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["assessor", "admin"])) {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = TemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const template = await AssessmentTemplate.create(parsed.data);
  return NextResponse.json({ ok: true, assessment: template }, { status: 201 });
}

