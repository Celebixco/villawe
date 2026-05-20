import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Gem,
  Leaf,
  Mountain,
  Shell,
  Sparkles,
  Waves,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { VillaConceptCard } from "@/components/public/villa-concept-card";

type ConceptCard = {
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  Icon: LucideIcon;
};

const conceptCards: ConceptCard[] = [
  {
    title: "Balayı Villaları",
    description: "Mahremiyet ve konfor.",
    href: "/villa-kiralama?honeymoon=1",
    imageUrl: "/images/regions/kas.webp",
    imageAlt: "Balayı villaları için Kaş kıyı manzarası",
    Icon: Sparkles,
  },
  {
    title: "Denize Yakın Villa",
    description: "Plaja kısa mesafede.",
    href: "/villa-kiralama?nearBeach=1",
    imageUrl: "/images/regions/bodrum.webp",
    imageAlt: "Denize yakın villa seçkisi için Bodrum kıyıları",
    Icon: Waves,
  },
  {
    title: "Deniz Manzaralı Villa",
    description: "Açık ufuk ve sahil manzarası.",
    href: "/villa-kiralama?seaView=1",
    imageUrl: "/images/regions/fethiye.webp",
    imageAlt: "Deniz manzaralı villalar için Fethiye görünümü",
    Icon: Shell,
  },
  {
    title: "Doğa Manzaralı Villa",
    description: "Sakin ve yeşil kaçışlar.",
    href: "/villa-kiralama?natureView=1",
    imageUrl: "/images/regions/sapanca.webp",
    imageAlt: "Doğa manzaralı villalar için Sapanca manzarası",
    Icon: Leaf,
  },
  {
    title: "Ekonomik Villa",
    description: "Dengeli fiyat, konforlu tatil.",
    href: "/villa-kiralama?economicalVilla=1",
    imageUrl: "/images/regions/marmaris.webp",
    imageAlt: "Ekonomik villa seçkisi için Marmaris koyları",
    Icon: Gem,
  },
  {
    title: "Jakuzili Villa",
    description: "Spa rahatlığı katan villalar.",
    href: "/villa-kiralama?jacuzzi=1",
    imageUrl: "/images/villawe/villa-pool.svg",
    imageAlt: "Jakuzili villa seçkisi için havuzlu villa görseli",
    Icon: Mountain,
  },
];

export function VillaConceptsSection() {
  return (
    <section id="konseptler" className="container-shell py-14 sm:py-16 lg:py-20">
      <div className="overflow-hidden rounded-[2.5rem] border border-border/60 bg-[radial-gradient(circle_at_top,rgba(69,194,210,0.12),transparent_30%),linear-gradient(180deg,#f7fbfc_0%,#f2f8fa_52%,#eef6f8_100%)] px-5 py-5 shadow-[0_42px_96px_-56px_rgba(7,74,88,0.35)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-primary/12 bg-[radial-gradient(circle_at_top,rgba(145,227,238,0.38),transparent_34%),linear-gradient(160deg,rgba(245,251,252,0.98)_0%,rgba(226,243,247,0.96)_52%,rgba(212,236,241,0.98)_100%)] p-6 shadow-[0_30px_86px_-56px_rgba(7,74,88,0.3)] sm:p-8">
            <div className="relative z-10 flex h-full flex-col gap-8">
              <div className="space-y-5">
                <p className="section-kicker">Villa Konseptleri</p>
                <div className="space-y-4">
                  <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                    Tatil tarzınıza göre seçin
                  </h2>
                  <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
                    Deniz kıyısından doğa kaçamaklarına, Villawe&apos;de her tatil tarzı için seçkin seçenekler.
                  </p>
                </div>
                <Link
                  href="/villa-kiralama"
                  className={buttonVariants({
                    className:
                      "w-fit rounded-full bg-primary px-6 text-primary-foreground shadow-[0_18px_36px_-22px_rgba(7,74,88,0.45)] hover:bg-primary/92",
                  })}
                >
                  Tüm Konseptleri Keşfet
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="relative min-h-[17rem] overflow-hidden rounded-[2rem] border border-white/50 bg-primary-dark shadow-[0_28px_76px_-48px_rgba(7,53,63,0.75)] sm:min-h-[19rem]">
                <Image
                  src="/images/regions/bodrum.webp"
                  alt="Villa konseptleri için lüks Bodrum kıyı görünümü"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1279px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,53,63,0.08)_0%,rgba(7,53,63,0.2)_30%,rgba(7,53,63,0.82)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(145,227,238,0.28),transparent_32%)]" />
                <div className="absolute left-5 top-5 rounded-[1.4rem] border border-white/16 bg-white/12 px-4 py-3 text-white shadow-[0_18px_36px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:left-6 sm:top-6">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/72">
                    Güvenilir Kiralama
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/92">
                    Doğrulanmış villa seçkisi
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <div className="max-w-sm space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/68">
                      Editoryal Seçki
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-balance sm:text-[2rem]">
                      Sahil, manzara ve konfor odağını tek bakışta karşılaştırın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-8 right-8 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(7,74,88,0.12),transparent)] xl:block" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {conceptCards.map((concept) => (
              <VillaConceptCard
                key={concept.title}
                href={concept.href}
                title={concept.title}
                description={concept.description}
                imageUrl={concept.imageUrl}
                imageAlt={concept.imageAlt}
                Icon={concept.Icon}
                className="min-h-[14.5rem] xl:min-h-[15.75rem]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
