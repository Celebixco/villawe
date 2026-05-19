import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Güvenli Villa Kiralama Rehberi | Villawe",
  description:
    "Sahte ilan ve platform dışı ödeme risklerini azaltmak için güvenli villa kiralama rehberi.",
  path: "/guvenli-villa-kiralama-rehberi",
});

export default function SafeGuidePage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Güvenli Kiralama Rehberi"
          title="Güvenli villa kiralama rehberi"
          description="Kullanıcıyı önce koruyan, sonra dönüştüren bir kiralama akışı için temel kontrol listemiz."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          "İlan yetkisi ve kimlik doğrulaması tamamlandı mı?",
          "Temizlik, hizmet ve depozito kalemleri rezervasyon öncesinde açık mı?",
          "Platform dışı ödeme veya acele kapora baskısı var mı?",
        ].map((item, index) => (
          <Card key={item} className="villawe-panel">
            <CardContent className="space-y-3 p-7">
              <p className="section-kicker">Kontrol {index + 1}</p>
              <p className="text-lg font-semibold tracking-tight">{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SafeRentalAlert />
    </div>
  );
}
