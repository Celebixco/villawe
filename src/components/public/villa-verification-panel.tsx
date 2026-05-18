import { BadgeCheck, BadgeInfo, MapPinned, PhoneCall, Shield, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { VerificationFlags } from "@/features/villas/types";

type VillaVerificationPanelProps = {
  verification: VerificationFlags;
};

const verificationItems = [
  {
    key: "identityVerified",
    label: "Kimlik Doğrulandı",
    icon: UserRoundCheck,
  },
  {
    key: "ownershipOrAuthorityVerified",
    label: "Mülkiyet / Yetki",
    icon: Shield,
  },
  {
    key: "tourismPermitVerified",
    label: "Belge Kontrolü",
    icon: BadgeInfo,
  },
  {
    key: "locationVerified",
    label: "Konum Doğrulandı",
    icon: MapPinned,
  },
  {
    key: "photosVerified",
    label: "Fotoğraflar Kontrol Edildi",
    icon: BadgeCheck,
  },
  {
    key: "phoneVerified",
    label: "Telefon Doğrulandı",
    icon: PhoneCall,
  },
] as const;

export function VillaVerificationPanel({
  verification,
}: VillaVerificationPanelProps) {
  return (
    <Card className="villawe-panel">
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="section-kicker">Villawe Güven Katmanı</p>
          <h2 className="text-3xl font-semibold tracking-tight">Villawe Doğrulama Süreci</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Rozetler dekoratif değildir; yalnızca veritabanındaki gerçek doğrulama alanlarına
            dayanır.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {verificationItems.map((item) => {
            const Icon = item.icon;
            const active = Boolean(verification[item.key]);

            return (
              <div
                key={item.key}
                className="rounded-[1.4rem] border border-border/75 bg-muted/72 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_14px_28px_-24px_rgba(18,110,130,0.22)]">
                    <Icon className="size-4" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <Badge variant={active ? "success" : "outline"}>
                      {active ? "Tamamlandı" : "Bekleniyor"}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {verification.lastVerifiedAt || verification.verifiedByLabel || verification.verificationNotes ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-card px-5 py-5 shadow-[0_14px_34px_-28px_rgba(18,110,130,0.18)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Son Kontrol
                </p>
                <p className="text-sm text-foreground">
                  {verification.lastVerifiedAt || "Tarih belirtilmedi"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Onaylayan
                </p>
                <p className="text-sm text-foreground">
                  {verification.verifiedByLabel || "Yönetici bilgisi paylaşılmadı"}
                </p>
              </div>
            </div>
            {verification.verificationNotes ? (
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {verification.verificationNotes}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
