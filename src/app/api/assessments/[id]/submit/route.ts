import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { AssessmentResult } from "@/lib/db/models/AssessmentResult";
import { Application } from "@/lib/db/models/Application";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";
import { languageToJudge0Id, runCodeWithJudge0 } from "@/lib/utils/judge0";
import { logAudit } from "@/lib/utils/audit";
import { createNotification } from "@/lib/utils/notifications";

const SubmitSchema = z.object({
  applicationId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.string(),
      timeSpent: z.number().optional().default(0),
    })
  ),
  proctoringLogs: z
    .array(
      z.object({
        eventType: z.string(),
        timestamp: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        flagged: z.boolean().optional().default(false),
      })
    )
    .optional(),
});

export async function POST(req: Request, context: { params: { id: string } }) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "candidate" || typeof token.uid !== "string") {
    return deny();
  }

  const body = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const application = await Application.findById(parsed.data.applicationId);
  if (!application || application.candidateId.toString() !== token.uid) return deny();

  const assessment = await AssessmentTemplate.findById(context.params.id);
  if (!assessment) {
    return NextResponse.json({ ok: false, error: "Assessment not found" }, { status: 404 });
  }

  let totalScore = 0;
  const gradedAnswers: Array<{
    questionId: string;
    answer: string;
    score: number;
    feedback: string;
    timeSpent: number;
  }> = [];

  for (const answer of parsed.data.answers) {
    const question = assessment.questions.find((q: any) => String(q._id) === answer.questionId);
    if (!question) continue;

    let score = 0;
    let feedback = "";

    if (question.type === "multiple_choice") {
      score = answer.answer === question.correctAnswer ? question.points : 0;
      feedback = score ? "Correct answer" : "Incorrect answer";
    } else if (question.type === "essay") {
      score = Math.min(question.points, Math.max(0, Math.round(question.points * 0.6)));
      feedback = "Essay auto-scored with baseline heuristic; manual review recommended.";
    } else if (question.type === "coding") {
      let passedCount = 0;
      const tests = question.testCases ?? [];
      for (const tc of tests) {
        const run = await runCodeWithJudge0({
          languageId: languageToJudge0Id(question.programmingLanguage || "python"),
          sourceCode: answer.answer,
          stdin: tc.input,
          expectedOutput: tc.expectedOutput,
        });
        if (run.passed) passedCount += 1;
      }
      score = tests.length ? Math.round((passedCount / tests.length) * question.points) : 0;
      feedback = `${passedCount}/${tests.length} test cases passed`;
    }

    totalScore += score;
    gradedAnswers.push({
      questionId: answer.questionId,
      answer: answer.answer,
      score,
      feedback,
      timeSpent: answer.timeSpent ?? 0,
    });
  }

  const passed = totalScore >= assessment.passingScore;
  const hasFlaggedLogs = (parsed.data.proctoringLogs ?? []).some((l) => Boolean(l.flagged));
  const hasEssayQuestion = assessment.questions.some((q: any) => q.type === "essay");
  const requiresManualReview = hasFlaggedLogs || hasEssayQuestion || !passed;

  const result = await AssessmentResult.findOneAndUpdate(
    {
      applicationId: new mongoose.Types.ObjectId(parsed.data.applicationId),
      assessmentId: new mongoose.Types.ObjectId(context.params.id),
    },
    {
      $set: {
        status: "completed",
        completedAt: new Date(),
        answers: gradedAnswers,
        totalScore,
        passed,
        requiresManualReview,
        manualReviewStatus: "pending",
        proctoringLogs: (parsed.data.proctoringLogs ?? []).map((l) => ({
          ...l,
          timestamp: l.timestamp ? new Date(l.timestamp) : new Date(),
          metadata: l.metadata ?? {},
        })),
      },
      $setOnInsert: {
        startedAt: new Date(),
        applicationId: new mongoose.Types.ObjectId(parsed.data.applicationId),
        assessmentId: new mongoose.Types.ObjectId(context.params.id),
      },
    },
    { upsert: true, new: true }
  );

  await Application.findByIdAndUpdate(parsed.data.applicationId, {
    $set: { status: "assessment_completed" },
  });

  await AssessmentInvitation.findOneAndUpdate(
    {
      applicationId: new mongoose.Types.ObjectId(parsed.data.applicationId),
      assessmentId: new mongoose.Types.ObjectId(context.params.id),
      candidateId: new mongoose.Types.ObjectId(token.uid),
    },
    {
      $set: {
        status: "submitted",
        submittedAt: new Date(),
      },
    }
  );

  // Candidate notification + audit trail.
  const candidateUserId = application.candidateId.toString();
  await createNotification({
    userId: candidateUserId,
    title: "Assessment submitted",
    message: passed
      ? "Your assessment was submitted. It will be finalized by a technical assessor."
      : "Your assessment was submitted and will go through manual technical review.",
    type: "assessment",
    link: `/candidate/assessments/${context.params.id}`,
  });
  await logAudit({
    req,
    token,
    action: "assessment_submitted",
    entityType: "AssessmentResult",
    entityId: result._id.toString(),
    details: { totalScore, passed },
  });

  return NextResponse.json({ ok: true, result });
}

