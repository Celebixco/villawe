import { createHash, randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

import {
  env,
  getStorageConfigurationError,
  isLocalStorageConfigured,
} from "@/lib/env";
import type { SaveFileInput, StorageService } from "@/lib/storage/types";

function sanitizeFileName(filename: string) {
  return filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export class LocalStorageService implements StorageService {
  async saveFile(input: SaveFileInput) {
    if (!isLocalStorageConfigured()) {
      throw new Error(
        getStorageConfigurationError() ||
          "Local storage yalnızca development ortamında açık ve yapılandırılmış olabilir.",
      );
    }

    const uploadDir = env.LOCAL_UPLOAD_DIR as string;
    const fileExt = path.extname(input.filename);
    const baseName = sanitizeFileName(path.basename(input.filename, fileExt));
    const fingerprint = createHash("sha1").update(input.buffer).digest("hex").slice(0, 12);
    const fileName = `${baseName}-${randomUUID().slice(0, 8)}-${fingerprint}${fileExt}`;
    const storagePrefix = input.target || input.kind;
    const storageKey = `${storagePrefix}/${input.kind}/${fileName}`;
    const destination = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      uploadDir,
      storageKey,
    );

    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, input.buffer);

    return {
      storageKey,
      bucket: "local-public",
      url: `/${path.join(uploadDir.replace(/^public\//, ""), storageKey).replaceAll("\\", "/")}`,
      originalName: input.filename,
      mimeType: input.contentType,
      sizeBytes: input.buffer.byteLength,
      kind: input.kind,
      altText: input.altText,
    };
  }

  async deleteFile(storageKey: string) {
    if (!isLocalStorageConfigured()) {
      throw new Error(
        getStorageConfigurationError() ||
          "Local storage yalnızca development ortamında açık ve yapılandırılmış olabilir.",
      );
    }

    const uploadDir = env.LOCAL_UPLOAD_DIR as string;
    const destination = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      uploadDir,
      storageKey,
    );
    await rm(destination, { force: true });
  }

  async readFile(storageKey: string) {
    if (!isLocalStorageConfigured()) {
      throw new Error(
        getStorageConfigurationError() ||
          "Local storage yalnızca development ortamında açık ve yapılandırılmış olabilir.",
      );
    }

    const uploadDir = env.LOCAL_UPLOAD_DIR as string;
    const destination = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      uploadDir,
      storageKey,
    );
    const buffer = await readFile(destination);
    const extension = path.extname(storageKey).toLowerCase();
    const contentType =
      extension === ".pdf"
        ? "application/pdf"
        : extension === ".png"
          ? "image/png"
          : extension === ".webp"
            ? "image/webp"
            : extension === ".avif"
              ? "image/avif"
              : "image/jpeg";

    return {
      buffer,
      contentType,
      sizeBytes: buffer.byteLength,
    };
  }
}
