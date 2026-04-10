import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { Application } from "@/lib/db/models/Application";

const ReportSchema = z.object({
  reportType: z.string().default("applications"),
  dateRange: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  format: z.enum(["csv", "json"]).default("csv"),
});

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  const body = await req.json().catch(() => null);
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const apps = await Application.find().populate("positionId", "title").populate("candidateId", "email");

  if (parsed.data.format === "json") {
    return NextResponse.json({ ok: true, data: apps });
  }

  const rows = [
    "applicationId,status,submittedAt,position,candidateEmail",
    ...apps.map((a: any) =>
      [
        a._id.toString(),
        a.status,
        a.submittedAt ? new Date(a.submittedAt).toISOString() : "",
        a.positionId?.title ?? "",
        a.candidateId?.email ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=report.csv",
    },
  });
}

