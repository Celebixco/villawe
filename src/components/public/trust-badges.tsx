import { Badge } from "@/components/ui/badge";
import type { VerificationFlags } from "@/features/villas/types";

type TrustBadgesProps = {
  verification: VerificationFlags;
  showInactive?: boolean;
};

export function TrustBadges({
  verification,
  showInactive = false,
}: TrustBadgesProps) {
  const badges = [
    {
      key: "verifiedVilla",
      active:
        verification.identityVerified &&
        verification.ownershipOrAuthorityVerified &&
        verification.tourismPermitVerified,
      label: "Doğrulanmış Villa",
      activeVariant: "success" as const,
    },
    {
      key: "tourismPermitVerified",
      active: verification.tourismPermitVerified,
      label: "Belge Kontrolü Yapıldı",
      activeVariant: "info" as const,
    },
    {
      key: "locationVerified",
      active: verification.locationVerified,
      label: "Konum Doğrulandı",
      activeVariant: "warning" as const,
    },
    {
      key: "photosVerified",
      active: verification.photosVerified,
      label: "Fotoğraflar Kontrol Edildi",
      activeVariant: "secondary" as const,
    },
    {
      key: "phoneVerified",
      active: verification.phoneVerified,
      label: "Telefon Doğrulandı",
      activeVariant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((item) => {
        const active = item.active;

        if (!active && !showInactive) {
          return null;
        }

        return (
          <Badge
            key={item.key}
            variant={active ? item.activeVariant : "outline"}
            className={!active ? "text-muted-foreground" : undefined}
          >
            {item.label}
          </Badge>
        );
      })}
    </div>
  );
}
