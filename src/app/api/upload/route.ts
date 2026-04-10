import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getAuthToken, deny } from "@/lib/utils/authz";

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function POST(req: Request) {
  const token = await getAuthToken(req);
  if (!token) return deny(401, "Unauthorized");

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
  }

  const maxSize = Number(process.env.MAX_FILE_SIZE ?? "5242880");
  if (file.size > maxSize) {
    return NextResponse.json({ ok: false, error: "File too large" }, { status: 413 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? "./public/uploads";
  const absDir = path.resolve(process.cwd(), uploadDir);
  await mkdir(absDir, { recursive: true });

  const ext = path.extname(file.name || "");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const absPath = path.join(absDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, bytes);

  const fileUrl = `/uploads/${filename}`;
  return NextResponse.json({ ok: true, fileUrl });
}

