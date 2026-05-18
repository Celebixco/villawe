import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Hakkımızda | Villawe",
  description: "Villawe'nin güven odaklı ürün yaklaşımı ve platform misyonu.",
  path: "/hakkimizda",
});

export default function AboutPage() {
  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Hakkımızda"
        title="Önce güven, sonra rezervasyon talebi"
        description="Villawe, villa kiralama pazarındaki sahte ilan, belirsiz kapora ve gizli ücret problemlerine ürün seviyesinde çözüm üretmek için kuruldu."
      />
      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-7 text-sm leading-7 text-muted-foreground">
          <p>
            Platformumuzda doğrulama rozetleri pazarlama etiketi değildir. Her rozetin arkasında
            veritabanında saklanan ve admin tarafından yönetilen gerçek bir kontrol alanı bulunur.
          </p>
          <p>
            İlk versiyonda online ödeme yerine güvenli talep akışı, şeffaf fiyat özeti ve operasyonel
            yönetim kalitesi üzerine odaklanıyoruz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
