import type { VillaDetail } from "@/features/villas/types";

type PricedVilla = Pick<VillaDetail, "pricing" | "maxGuests">;

function toDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function calculateNightCount(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = toDate(startDate);
  const end = toDate(endDate);
  const milliseconds = end.getTime() - start.getTime();

  return Math.max(Math.round(milliseconds / (1000 * 60 * 60 * 24)), 0);
}

export function resolveNightlyPrice(
  villa: PricedVilla,
  startDate?: string,
  endDate?: string,
) {
  if (!startDate || !endDate) {
    return villa.pricing.basePrice;
  }

  const matchingSeason = villa.pricing.seasonPrices.find((season) => {
    return startDate >= season.startDate && endDate <= season.endDate;
  });

  return matchingSeason?.nightlyPrice || villa.pricing.basePrice;
}

export function calculateVillaEstimate(
  villa: PricedVilla,
  startDate?: string,
  endDate?: string,
  guestCount = 1,
) {
  const nights = calculateNightCount(startDate, endDate);
  const nightlyPrice = resolveNightlyPrice(villa, startDate, endDate);
  const nightlySubtotal = nights > 0 ? nightlyPrice * nights : nightlyPrice;
  const extraGuestCount = Math.max(guestCount - villa.maxGuests, 0);
  const extraGuestFee = extraGuestCount * villa.pricing.extraGuestFee;
  const serviceFee =
    villa.pricing.serviceFeeType === "percentage"
      ? nightlySubtotal * (villa.pricing.serviceFeeValue / 100)
      : villa.pricing.serviceFeeType === "fixed"
        ? villa.pricing.serviceFeeValue
        : 0;

  const total =
    nightlySubtotal + villa.pricing.cleaningFee + villa.pricing.depositAmount + serviceFee + extraGuestFee;

  return {
    nights,
    nightlyPrice,
    nightlySubtotal,
    extraGuestFee,
    serviceFee,
    total,
  };
}
