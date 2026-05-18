import { randomUUID } from "crypto";
import path from "path";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/lib/env";
import type { SaveFileInput, StorageService } from "@/lib/storage/types";

let r2Client: S3Client | null = null;

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  if (
    !env.R2_ENDPOINT ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY
  ) {
    throw new Error("Cloudflare R2 environment variables are incomplete.");
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return r2Client;
}

function sanitizeFileName(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export class R2StorageService implements StorageService {
  async saveFile(input: SaveFileInput) {
    if (!env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
      throw new Error("Cloudflare R2 bucket or public base URL is missing.");
    }

    const fileExt = path.extname(input.filename);
    const baseName = sanitizeFileName(path.basename(input.filename, fileExt));
    const storagePrefix = input.target || input.kind;
    const storageKey = `${storagePrefix}/${input.kind}/${new Date().getUTCFullYear()}/${baseName}-${randomUUID()}${fileExt}`;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );

    return {
      storageKey,
      bucket: env.R2_BUCKET_NAME,
      url: `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${storageKey}`,
      originalName: input.filename,
      mimeType: input.contentType,
      sizeBytes: input.buffer.byteLength,
      kind: input.kind,
      altText: input.altText,
    };
  }

  async deleteFile(storageKey: string) {
    if (!env.R2_BUCKET_NAME) {
      throw new Error("Cloudflare R2 bucket is missing.");
    }

    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: storageKey,
      }),
    );
  }
}
