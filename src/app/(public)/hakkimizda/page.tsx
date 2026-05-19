import Link from "next/link";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Hakkımızda | Villawe",
  description: "Villawe'nin güven odaklı ürün yaklaşımı ve platform misyonu.",
  path: "/hakkimizda",
});

export default function AboutPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Hakkımızda"
          title="Önce güven, sonra rezervasyon talebi"
          description="Villawe, villa kiralama pazarındaki sahte ilan, belirsiz kapora ve gizli ücret problemlerine ürün seviyesinde çözüm üretmek için kuruldu."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-7 text-sm leading-8 text-muted-foreground sm:text-base">
            <p>
              Platformumuzda doğrulama rozetleri pazarlama etiketi değildir. Her rozetin
              arkasında veritabanında saklanan ve admin tarafından yönetilen gerçek bir kontrol alanı bulunur.
            </p>
            <p>
              İlk versiyonda online ödeme yerine güvenli talep akışı, şeffaf fiyat özeti ve operasyonel
              yönetim kalitesi üzerine odaklanıyoruz.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          {[
            {
              icon: ShieldCheck,
              title: "Gerçek doğrulama mantığı",
              body: "Yalnızca tamamlanan kontrol alanları kamuya açık rozetlere dönüşür.",
            },
            {
              icon: Compass,
              title: "Karar dostu arama deneyimi",
              body: "Bölge, konsept ve yaşam tarzı filtresi aynı akışta birleşir.",
            },
            {
              icon: Sparkles,
              title: "Premium ama sade ürün dili",
              body: "Karmaşık değil; güven veren, net ve modern bir tatil keşif deneyimi.",
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
