import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Application } from "@/lib/db/models/Application";
import { Position } from "@/lib/db/models/Position";
import { AssessmentResult } from "@/lib/db/models/AssessmentResult";

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  await connectToMongo();

  const totalApplications = await Application.countDocuments();
  const positionsByDepartment = await Position.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const applicationFunnel = await Application.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const passed = await AssessmentResult.countDocuments({ passed: true, status: "completed" });
  const completed = await AssessmentResult.countDocuments({ status: "completed" });
  const assessmentPassRate = completed ? Math.round((passed / completed) * 100) : 0;

  return NextResponse.json({
    ok: true,
    totalApplications,
    positionsByDepartment,
    applicationFunnel,
    averageTimeToHire: 0,
    assessmentPassRate,
    demographics: {},
  });
}

