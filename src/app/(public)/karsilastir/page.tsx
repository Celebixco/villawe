import { SectionHeading } from "@/components/public/section-heading";
import { CompareClientView } from "@/components/public/compare-client-view";
import { buildMetadata } from "@/features/seo/metadata";
import { getAllPublishedVillas } from "@/features/villas/queries";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Karşılaştır | Villawe",
  description: "Seçtiğiniz villaları temel güven ve fiyat alanlarıyla karşılaştırın.",
  path: "/karsilastir",
  noIndex: true,
});

export default async function ComparePage() {
  const villas = await getAllPublishedVillas();

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Karşılaştırma"
        title="Villa karşılaştırma"
        description="Bölge, kapasite, havuz özellikleri, başlangıç fiyatı ve doğrulama rozetlerini yan yana görün."
      />
      <CompareClientView villas={villas} />
    </div>
  );
}
