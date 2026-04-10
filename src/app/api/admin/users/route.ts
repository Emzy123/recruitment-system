import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { hashPassword } from "@/lib/utils/bcrypt";
import { logAudit } from "@/lib/utils/audit";

const RoleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["candidate", "committee", "assessor", "admin"]),
});

const UserCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["committee", "assessor"]),
});

export async function GET(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? "20")));

  await connectToMongo();

  const filter: any = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);
  const items = await User.find(filter)
    .select("email firstName lastName role isActive lastLogin createdAt")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return NextResponse.json({ ok: true, page, limit, total, items });
}

export async function PUT(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  const body = await req.json().catch(() => null);
  const parsed = RoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const user = await User.findByIdAndUpdate(parsed.data.userId, { $set: { role: parsed.data.role } }, { new: true });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token || token.role !== "admin") return deny();

  const body = await req.json().catch(() => null);
  const parsed = UserCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToMongo();
  const { email, firstName, lastName, password, role } = parsed.data;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase().trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    passwordHash,
    role,
    isActive: true,
    emailVerified: true,
  });

  await logAudit({
    req,
    token: token as any,
    action: "user_created_by_admin",
    entityType: "User",
    entityId: user._id.toString(),
    details: { createdRole: role },
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}

