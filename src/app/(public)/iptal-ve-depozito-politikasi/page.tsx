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
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="İptal ve Depozito"
        title="İptal ve depozito politikası"
        description="Villawe, kullanıcıya ücret kalemlerini ve iade koşullarını rezervasyon talebinden önce görünür kılar."
      />
      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-7 text-sm leading-7 text-muted-foreground">
          <p>İptal politikası villa bazında değişebilir ancak özet alanı daima kullanıcıya açık gösterilir.</p>
          <p>Depozito koşulları, hasar iadesi süresi ve tahsil yöntemi ayrı alanlar halinde saklanır.</p>
          <p>Hiçbir ilan depozito veya hizmet bedelini gizleyerek talep toplamaz.</p>
        </CardContent>
      </Card>
    </div>
  );
}
