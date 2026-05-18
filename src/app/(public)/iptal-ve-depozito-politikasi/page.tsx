import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "İptal ve Depozito Politikası | Villawe",
  description: "Villawe iptal ve depozito politikası altyapısı.",
  path: "/iptal-ve-depozito-politikasi",
});

export default function CancellationPolicyPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="İptal ve Depozito"
          title="İptal ve depozito politikası"
          description="Villawe, kullanıcıya ücret kalemlerini ve iade koşullarını rezervasyon talebinden önce görünür kılar."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          "İptal politikası villa bazında değişebilir ancak özet alanı daima kullanıcıya açık gösterilir.",
          "Depozito koşulları, hasar iadesi süresi ve tahsil yöntemi ayrı alanlar halinde saklanır.",
          "Hiçbir ilan depozito veya hizmet bedelini gizleyerek talep toplamaz.",
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
