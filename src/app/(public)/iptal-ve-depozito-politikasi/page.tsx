import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "İptal ve Depozito Politikası | Villawe",
  description: "İptal ve depozito süreçlerine dair kısa ve net özet.",
  path: "/iptal-ve-depozito-politikasi",
});

export default function CancellationPolicyPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="İptal ve Depozito"
          title="İptal ve depozito"
          description="Talep öncesinde görmeniz gereken temel koşullar."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          "İptal koşulları villa bazında değişebilir; temel özet her zaman talep öncesinde görünür.",
          "Depozito tutarı ve iade çerçevesi rezervasyon kararı öncesinde açıkça paylaşılır.",
          "Ek ücretler gizlenmeden gösterilir; toplam maliyet daha ilk adımda netleşir.",
        ].map((item) => (
          <Card key={item} className="villawe-panel">
            <CardContent className="p-7 text-sm leading-7 text-muted-foreground">
              {item}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
