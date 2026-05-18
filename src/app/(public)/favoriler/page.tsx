import { SectionHeading } from "@/components/public/section-heading";
import { FavoritesClientView } from "@/components/public/favorites-client-view";
import { buildMetadata } from "@/features/seo/metadata";
import { getAllPublishedVillas } from "@/features/villas/queries";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Favoriler | Villawe",
  description: "Seçtiğiniz villaları favori listesinde yeniden görün.",
  path: "/favoriler",
  noIndex: true,
});

export default async function FavoritesPage() {
  const villas = await getAllPublishedVillas();

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Favoriler"
        title="Favori villalarınız"
        description="Bu ilk sürümde favori listeniz tarayıcıda tutulur; ileride kullanıcı hesabına taşınabilir."
      />
      <FavoritesClientView villas={villas} />
    </div>
  );
}
