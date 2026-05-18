export type StoredFileKind = "image" | "document" | "avatar" | "other";
export type StorageTarget = "villa-media" | "villa-document" | "owner-document" | "blog-media" | "other";

export type SaveFileInput = {
  buffer: Buffer;
  filename: string;
  contentType: string;
  kind: StoredFileKind;
  target?: StorageTarget | undefined;
  altText?: string | undefined;
};

export type StoredFileResult = {
  storageKey: string;
  bucket: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: StoredFileKind;
  altText?: string | undefined;
};

export interface StorageService {
  saveFile(input: SaveFileInput): Promise<StoredFileResult>;
  deleteFile(storageKey: string): Promise<void>;
}
