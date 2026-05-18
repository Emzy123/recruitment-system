import { NextResponse } from "next/server";
import { getAuthToken, deny } from "@/lib/utils/authz";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { getStorageProvider } from "@/lib/storage";

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const POST = withErrorHandler(async (req: Request) => {
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

  const storageProvider = getStorageProvider();
  const fileUrl = await storageProvider.uploadFile(file);

  return NextResponse.json({ ok: true, fileUrl });
});

