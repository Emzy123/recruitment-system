import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { getAuthToken, hasAnyRole, deny } from "@/lib/utils/authz";

export async function GET(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || !hasAnyRole(token.role as string, ["candidate", "committee", "assessor", "admin"])) {
    return deny();
  }

  await connectToMongo();
  const assessment = await AssessmentTemplate.findById(context.params.id);
  if (!assessment) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  if (token.role === "candidate") {
    const sanitized = assessment.toObject();
    sanitized.questions = sanitized.questions.map((q: any) => ({
      ...q,
      correctAnswer: undefined,
      testCases: (q.testCases ?? []).filter((tc: any) => !tc.isHidden),
    }));
    return NextResponse.json({ ok: true, assessment: sanitized });
  }

  return NextResponse.json({ ok: true, assessment });
}

