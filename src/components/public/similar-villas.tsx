import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { VillaCard as VillaCardRecord } from "@/features/villas/types";
import { getPublicVillaCopy } from "@/lib/demo-villa";

type SimilarVillasProps = {
  villas: VillaCardRecord[];
};

export function SimilarVillas({ villas }: SimilarVillasProps) {
  if (!villas.length) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="section-kicker">Benzer Seçenekler</p>
        <h2 className="text-3xl font-semibold tracking-tight">Benzer villalar</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {villas.map((villa) => {
          const content = getPublicVillaCopy(villa);
          const isVerified =
            villa.verification.identityVerified &&
            villa.verification.ownershipOrAuthorityVerified &&
            villa.verification.tourismPermitVerified;

          return (
            <Card
              key={villa.id}
              className="group/card flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_16px_48px_-34px_rgba(18,110,130,0.18)] transition duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_28px_70px_-36px_rgba(18,110,130,0.24)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={villa.coverImage.url}
                  alt={villa.coverImage.alt}
                  fill
                  className="object-cover transition duration-500 group-hover/card:scale-105"
                  sizes="(max-width: 768px) 100vw, 28vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary-dark/82 via-primary-dark/12 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {content.isDemo ? (
                    <Badge variant="warning" className="border-white/18 bg-white/14 text-white backdrop-blur-sm">
                      {content.demoBadgeLabel}
                    </Badge>
                  ) : null}
                  {isVerified ? (
                    <Badge variant="success" className="border-white/18 bg-white/12 text-white backdrop-blur-sm">
                      <ShieldCheck className="size-3.5" />
                      Doğrulanmış
                    </Badge>
                  ) : null}
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3.5 text-secondary" />
                    {villa.district.name}, {villa.region.name}
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">{content.displayTitle}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-[1.4rem] border border-border/70 bg-muted/70 p-4 text-sm">
                  <div className="space-y-1">
                    <p className="inline-flex items-center gap-2 text-muted-foreground">
                      <Users className="size-4 text-secondary" />
                      Misafir
                    </p>
                    <p className="font-semibold text-foreground">{villa.maxGuests}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="inline-flex items-center gap-2 text-muted-foreground">
                      <BedDouble className="size-4 text-secondary" />
                      Oda
                    </p>
                    <p className="font-semibold text-foreground">{villa.bedroomCount}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 px-5 py-5">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gecelikten başlayan</p>
                  <p className="text-2xl font-semibold tracking-tight text-primary">
                    ₺{villa.pricing.basePrice.toLocaleString("tr-TR")}
                  </p>
                </div>
                <Link
                  href={`/villalar/${villa.slug}`}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
                >
                  Detayları İncele
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
