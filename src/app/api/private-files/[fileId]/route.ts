import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import { getOwnerSession } from "@/lib/auth/owner-session";
import { getPrisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const prisma = getPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Dosya servisi şu anda kullanılamıyor." },
      { status: 503 },
    );
  }

  const [adminSession, ownerSession] = await Promise.all([
    getAdminSession(),
    getOwnerSession(),
  ]);

  if (!adminSession && !ownerSession) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const file = await prisma.uploadedFile.findUnique({
    where: { id: fileId },
    include: {
      ownerDocuments: {
        select: {
          ownerId: true,
        },
      },
      villaDocuments: {
        select: {
          villa: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }

  if (!adminSession) {
    const ownerId = ownerSession?.ownerId;
    const ownsOwnerDocument = file.ownerDocuments.some((item) => item.ownerId === ownerId);
    const ownsVillaDocument = file.villaDocuments.some(
      (item) => item.villa.ownerId === ownerId,
    );

    if (!ownsOwnerDocument && !ownsVillaDocument) {
      return NextResponse.json({ error: "Bu dosyaya erişim izniniz yok." }, { status: 403 });
    }
  }

  const stored = await getStorageService().readFile(file.storageKey);

  return new NextResponse(stored.buffer, {
    headers: {
      "content-type": file.mimeType || stored.contentType,
      "content-length": String(stored.sizeBytes),
      "content-disposition": `inline; filename="${encodeURIComponent(file.originalName)}"`,
      "cache-control": "private, no-store",
    },
  });
}
