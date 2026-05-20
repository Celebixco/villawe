import Link from "next/link";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Hakkımızda | Villawe",
  description: "Villawe'nin seçkin, güvenli ve sade tatil deneyimine yaklaşımı.",
  path: "/hakkimizda",
});

export default function AboutPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Hakkımızda"
          title="Villawe hakkında"
          description="Özenle seçilmiş villaları net fiyat ve güvenli talep deneyimiyle buluşturuyoruz."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-7 text-sm leading-8 text-muted-foreground sm:text-base">
            <p>
              Villawe, tatil planını yormayan ama güven duygusunu da geri plana itmeyen bir villa seçkisi sunmak için tasarlandı.
            </p>
            <p>
              Seçkin ilanları, net fiyat bilgisini ve güvenli talep akışını sade bir deneyimde bir araya getiriyoruz.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          {[
            {
              icon: ShieldCheck,
              title: "Doğrulanmış seçki",
              body: "Güven veren ilanları öne çıkaran sakin ve seçici bir katalog.",
            },
            {
              icon: Compass,
              title: "Karar dostu arama",
              body: "Bölge, konsept ve yaşam tarzı tercihlerine göre net bir keşif akışı.",
            },
            {
              icon: Sparkles,
              title: "Sade lüks yaklaşımı",
              body: "Kalabalık değil; dingin, modern ve tatil odaklı bir marka dili.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="villawe-soft-panel">
                <CardContent className="space-y-3 p-6">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_38px_-28px_rgba(18,110,130,0.24)]">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{item.title}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/villa-kiralama"
          className={buttonVariants({
            className: "rounded-full",
          })}
        >
          Villaları Keşfet
        </Link>
        <Link
          href="/guvenli-villa-kiralama-rehberi"
          className={buttonVariants({
            variant: "outline",
            className: "rounded-full",
          })}
        >
          Güvenli Kiralama Rehberini Oku
        </Link>
      </div>
    </div>
  );
}
