import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { BadgeCheck, CheckCircle2, MapPinned, Shield, UserRoundCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { VerificationFlags } from "@/features/villas/types";

type VillaVerificationPanelProps = {
  verification: VerificationFlags;
};

const verificationItems = [
  {
    key: "identityAndAuthorityVerified",
    label: "Kimlik / Yetki",
    icon: UserRoundCheck,
  },
  {
    key: "tourismPermitVerified",
    label: "Belge",
    icon: Shield,
  },
  {
    key: "locationVerified",
    label: "Konum",
    icon: MapPinned,
  },
  {
    key: "photosVerified",
    label: "Fotoğraf",
    icon: BadgeCheck,
  },
] as const;

function formatVerifiedDate(value: string) {
  try {
    return format(parseISO(value), "d MMMM yyyy", { locale: tr });
  } catch {
    return value;
  }
}

export function VillaVerificationPanel({
  verification,
}: VillaVerificationPanelProps) {
  return (
    <Card className="villawe-soft-panel">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Villawe kontrolünden geçti</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Kimlik, belge, konum ve fotoğraf kontrolleri tamamlandı.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {verificationItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.key === "identityAndAuthorityVerified"
                ? Boolean(
                    verification.identityVerified &&
                      verification.ownershipOrAuthorityVerified,
                  )
                : Boolean(verification[item.key]);

            return (
              <div
                key={item.key}
                className="rounded-[1.4rem] border border-border/75 bg-muted/72 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_14px_28px_-24px_rgba(18,110,130,0.22)]">
                      <Icon className="size-4" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  </div>
                  {active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="size-3.5" />
                      Onaylı
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">İnceleniyor</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {verification.lastVerifiedAt ? (
          <p className="text-xs text-muted-foreground">
            Son kontrol: {formatVerifiedDate(verification.lastVerifiedAt)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
