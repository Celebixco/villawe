"use server";

import { redirect } from "next/navigation";

import { getPriceSnapshotPreview, getVillaBySlug } from "@/features/villas/queries";
import { getPrisma } from "@/lib/db/prisma";
import { canUseDemoData, isDatabaseConfigured } from "@/lib/env";
import { enforceRateLimit, getRequestRateLimitKey } from "@/lib/rate-limit";
import { inquiryFormSchema } from "@/lib/validation/forms";

function getErrorRedirect(path: string, message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`;
}

function redirectTo(path: string): never {
  redirect(path as never);
}

function hasAvailabilityConflict(
  availabilityBlocks: Array<{ startDate: string; endDate: string }>,
  startDate: string,
  endDate: string,
) {
  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);

  return availabilityBlocks.some((block) => {
    const blockStart = new Date(block.startDate);
    const blockEnd = new Date(block.endDate);

    return requestedStart < blockEnd && requestedEnd > blockStart;
  });
}

export async function createInquiryAction(formData: FormData) {
  const sourcePath = `/villalar/${formData.get("villaSlug")}`;

  try {
    const rateLimitKey = await getRequestRateLimitKey(
      "public-inquiry",
      `${formData.get("villaSlug") || "unknown"}:${formData.get("email") || "guest"}`,
    );

    await enforceRateLimit({
      scope: "public-inquiry",
      key: rateLimitKey,
      limit: 6,
      windowSeconds: 300,
      message: "Kısa sürede çok fazla talep gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.",
    });
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        error instanceof Error
          ? error.message
          : "Talep limiti aşıldı. Lütfen daha sonra tekrar deneyin.",
      ),
    );
  }

  const parsed = inquiryFormSchema.safeParse({
    villaSlug: formData.get("villaSlug"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    guestCount: formData.get("guestCount"),
    message: formData.get("message") || undefined,
    depositWarningAcknowledged: formData.get("depositWarningAcknowledged"),
    offPlatformPaymentWarningAcknowledged: formData.get("offPlatformPaymentWarningAcknowledged"),
  });

  if (!parsed.success) {
    redirectTo(getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Talep bilgileri geçersiz."));
  }

  const villa = await getVillaBySlug(parsed.data.villaSlug);

  if (!villa) {
    redirectTo(getErrorRedirect("/villa-kiralama", "Seçili villa bulunamadı."));
  }

  const snapshot = getPriceSnapshotPreview(
    villa,
    parsed.data.startDate,
    parsed.data.endDate,
    parsed.data.guestCount,
  );

  if (parsed.data.guestCount > villa.maxGuests) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        `Seçtiğiniz villa en fazla ${villa.maxGuests} misafir kabul ediyor.`,
      ),
    );
  }

  if (parsed.data.startDate && parsed.data.endDate) {
    if (
      hasAvailabilityConflict(
        villa.availabilityBlocks,
        parsed.data.startDate,
        parsed.data.endDate,
      )
    ) {
      redirectTo(
        getErrorRedirect(
          sourcePath,
          "Seçtiğiniz tarih aralığı mevcut bloke veya rezervasyonla çakışıyor.",
        ),
      );
    }

    if (snapshot.nights && snapshot.nights < villa.pricing.minNights) {
      redirectTo(
        getErrorRedirect(
          sourcePath,
          `Bu villa için minimum konaklama ${villa.pricing.minNights} gecedir.`,
        ),
      );
    }
  }

  const prisma = getPrisma();

  if (prisma && isDatabaseConfigured()) {
    await prisma.inquiry.create({
      data: {
        villaId: villa.id,
        status: "NEW",
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        nights: snapshot.nights || null,
        guestCount: parsed.data.guestCount,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message || null,
        depositWarningAcknowledged: parsed.data.depositWarningAcknowledged,
        offPlatformPaymentWarningAcknowledged:
          parsed.data.offPlatformPaymentWarningAcknowledged,
        estimatedTotal: snapshot.total,
        pricingSnapshot: snapshot,
      },
    });

    redirectTo(`/rezervasyon-talebi?success=1&villa=${encodeURIComponent(villa.slug)}`);
  }

  if (canUseDemoData()) {
    redirectTo(`/rezervasyon-talebi?success=demo&villa=${encodeURIComponent(villa.slug)}`);
  }

  redirectTo(
    getErrorRedirect(
      sourcePath,
      "Talep kaydı şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.",
    ),
  );
}
