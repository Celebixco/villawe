import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Güvenli Villa Kiralama Rehberi | Villawe",
  description:
    "Villa seçerken dikkat edilmesi gereken temel güven adımlarını özetleyen rehber.",
  path: "/guvenli-villa-kiralama-rehberi",
});

export default function SafeGuidePage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Güvenli Kiralama Rehberi"
          title="Güvenli villa kiralama rehberi"
          description="Tatil planı yaparken bakmanız gereken temel başlıklar."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Yetki ve iletişim",
            body: "Villa bilgileri, iletişim akışı ve talep süreci açıkça gösterilmelidir.",
          },
          {
            title: "Net fiyat",
            body: "Temizlik, hizmet ve depozito gibi kalemler talep öncesinde görünür olmalıdır.",
          },
          {
            title: "Ödeme güvenliği",
            body: "Resmi akış dışına çıkan ödeme taleplerinde işlemi durdurun ve teyit isteyin.",
          },
        ].map((item) => (
          <Card key={item.title} className="villawe-panel">
            <CardContent className="space-y-3 p-7">
              <p className="section-kicker">Kontrol</p>
              <p className="text-lg font-semibold tracking-tight">{item.title}</p>
              <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SafeRentalAlert />
    </div>
  );
}
