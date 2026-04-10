import { Types } from "mongoose";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { connectToMongo } from "@/lib/mongodb";

export async function logAudit(params: {
  req: Request;
  token?: { uid?: unknown };
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  const { req, token, action, entityType, entityId, details } = params;

  const ipAddress =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "";
  const userAgent = req.headers.get("user-agent") ?? "";
  const userId =
    typeof token?.uid === "string" && token.uid ? new Types.ObjectId(token.uid) : undefined;

  await connectToMongo();

  await AuditLog.create({
    userId,
    action,
    entityType,
    entityId,
    details: details ?? {},
    ipAddress,
    userAgent,
    timestamp: new Date(),
  });
}

