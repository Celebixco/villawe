import Link from "next/link";

import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Rezervasyon Talebi | Villawe",
  description: "Rezervasyon talebi sonrası güvenli yönlendirme ve bilgilendirme akışı.",
  path: "/rezervasyon-talebi",
});

type ReservationRequestPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReservationRequestPage({
  searchParams,
}: ReservationRequestPageProps) {
  const resolved = await searchParams;
  const success = typeof resolved.success === "string" ? resolved.success : undefined;
  const villaSlug = typeof resolved.villa === "string" ? resolved.villa : undefined;

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Talep Akışı"
        title={success === "1" ? "Talebiniz alındı" : success === "demo" ? "Demo talep önizlemesi" : "Rezervasyon talep akışı"}
        description={
          success === "1"
            ? "Ekibimiz fiyat özeti ve müsaitlik durumunu çakışma kontrolüyle inceleyip size dönüş yapacak."
            : success === "demo"
              ? "Demo modunda talep formu test edildi; kayıt veritabanına yazılmadı."
            : "Talep sürecinde kapora, iptal ve müsaitlik çakışmaları güven odaklı biçimde ele alınır."
        }
      />

      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">Sıradaki adımlar</h2>
          {villaSlug ? (
            <p className="text-sm text-muted-foreground">
              Villa: <strong>{villaSlug}</strong>
            </p>
          ) : null}
          <div className="space-y-2 text-sm leading-7 text-muted-foreground">
            <p>1. Müsaitlik takvimi ve mevcut talepler karşılaştırılır.</p>
            <p>2. Fiyat özeti ve ekstra ücretler tekrar doğrulanır.</p>
            <p>3. Onay öncesi ödeme yönlendirmesi yalnızca platform içi süreçle paylaşılır.</p>
          </div>
          <Link
            href="/villa-kiralama"
            className={buttonVariants({
              className: "rounded-full",
            })}
          >
            Tekrar villa ara
          </Link>
        </CardContent>
      </Card>

      <SafeRentalAlert />
    </div>
  );
}
