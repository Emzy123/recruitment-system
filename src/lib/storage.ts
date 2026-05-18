import { mkdir, writeFile } from "fs/promises";
import path from "path";

// In a real production app, you would use the AWS SDK:
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface StorageProvider {
  uploadFile(file: File): Promise<string>;
}

export class LocalStorageProvider implements StorageProvider {
  async uploadFile(file: File): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
    const absDir = path.isAbsolute(uploadDir) ? uploadDir : path.join(process.cwd(), uploadDir);
    await mkdir(absDir, { recursive: true });

    const ext = path.extname(file.name || "");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const absPath = path.join(absDir, filename);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(absPath, bytes);

    return `/uploads/${filename}`;
  }
}

export class S3StorageProvider implements StorageProvider {
  async uploadFile(file: File): Promise<string> {
    // Stub implementation for S3 upload. 
    // This allows the app to cleanly switch storage engines via ENV vars.
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({ ... });
    // await s3.send(command);

    console.warn("S3 Storage Provider called. Returning mock URL.");
    const ext = path.extname(file.name || "");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    return `https://mock-s3-bucket.s3.amazonaws.com/uploads/${filename}`;
  }
}

export function getStorageProvider(): StorageProvider {
  if (process.env.STORAGE_PROVIDER === "s3") {
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}
