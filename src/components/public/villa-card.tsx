import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, ShieldCheck, Users, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TrustBadges } from "@/components/public/trust-badges";
import { VillaSelectionControls } from "@/components/public/villa-selection-controls";
import type { VillaCard as VillaCardType } from "@/features/villas/types";

type VillaCardProps = {
  villa: VillaCardType;
};

export function VillaCard({ villa }: VillaCardProps) {
  const isFullyVerified =
    villa.verification.identityVerified &&
    villa.verification.ownershipOrAuthorityVerified &&
    villa.verification.tourismPermitVerified;

  return (
    <Card className="villawe-panel overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_28px_70px_-36px_rgba(18,110,130,0.3)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={villa.coverImage.url}
          alt={villa.coverImage.alt}
          fill
          className="object-cover transition duration-500 group-hover/card:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-primary-dark/85 via-primary-dark/20 to-transparent" />
        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          {isFullyVerified ? (
            <Badge variant="success" className="shadow-sm">
              <ShieldCheck className="size-3.5" />
              Doğrulanmış Villa
            </Badge>
          ) : null}
          {villa.concepts.slice(0, 2).map((concept) => (
            <Badge
              key={concept.slug}
              variant="outline"
              className="bg-card/94 text-primary-dark backdrop-blur-sm"
            >
              {concept.name}
            </Badge>
          ))}
        </div>
        <div className="absolute right-5 top-5">
          <VillaSelectionControls villaId={villa.id} compact />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 text-white">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-medium text-white/74">
              <MapPin className="size-3.5" />
              {villa.district.name}, {villa.region.name}
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">{villa.title}</h3>
          </div>
        </div>
      </div>
      <CardContent className="space-y-4 p-6">
        <p className="text-sm leading-7 text-muted-foreground">{villa.shortDescription}</p>

        <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-border/70 bg-muted/70 p-4 text-sm sm:grid-cols-4">
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
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Bath className="size-4 text-secondary" />
              Banyo
            </p>
            <p className="font-semibold text-foreground">{villa.bathroomCount}</p>
          </div>
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-muted-foreground">
              <Waves className="size-4 text-secondary" />
              Havuz
            </p>
            <p className="font-semibold text-foreground">
              {villa.features.hasPrivatePool ? "Özel" : "Ortak"}
            </p>
          </div>
        </div>

        <TrustBadges verification={villa.verification} />
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Başlangıç fiyatı</p>
          <p className="text-3xl font-semibold tracking-tight text-primary">
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
}
