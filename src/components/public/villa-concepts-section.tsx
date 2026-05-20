import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Palmtree,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Trees,
  Waves,
} from "lucide-react";

import { VillaConceptCard } from "@/components/public/villa-concept-card";
import { buttonVariants } from "@/components/ui/button";
import featuredConceptVilla from "../../../public/images/concepts/featured-concept-villa.webp";
import honeymoonVilla from "../../../public/images/concepts/honeymoon-villa.webp";
import nearSeaVilla from "../../../public/images/concepts/near-sea-villa.webp";
import seaViewVilla from "../../../public/images/concepts/sea-view-villa.webp";
import natureViewVilla from "../../../public/images/concepts/nature-view-villa.webp";
import economicVilla from "../../../public/images/concepts/economic-villa.webp";
import jacuzziVilla from "../../../public/images/concepts/jacuzzi-villa.webp";

const curatedConcepts = [
  {
    slug: "balayi-villalari",
    title: "Balayı Villaları",
    description: "Özel anlar için seçilmiş, mahremiyet ve konfor.",
    imageUrl: honeymoonVilla,
    imageAlt: "Balayı villaları konsepti için gün batımında havuz manzaralı villa",
    icon: Palmtree,
  },
  {
    slug: "denize-yakin-villa",
    title: "Denize Yakın Villa",
    description: "Plaja ve kıyı yaşamına kısa mesafede.",
    imageUrl: nearSeaVilla,
    imageAlt: "Denize yakın villa konsepti için havuzlu kıyı villası",
    icon: Waves,
  },
  {
    slug: "deniz-manzarali-villa",
    title: "Deniz Manzaralı Villa",
    description: "Açık ufuk ve panoramik sahil manzarası sunan.",
    imageUrl: seaViewVilla,
    imageAlt: "Deniz manzaralı villa konsepti için panoramik havuzlu villa",
    icon: Sunrise,
  },
  {
    slug: "doga-manzarali-villa",
    title: "Doğa Manzaralı Villa",
    description: "Yeşil doku ve sakin manzarayla öne çıkan.",
    imageUrl: natureViewVilla,
    imageAlt: "Doğa manzaralı villa konsepti için yeşillikler içindeki yamaç villaları",
    icon: Trees,
  },
  {
    slug: "ekonomik-villa",
    title: "Ekonomik Villa",
    description: "Fiyat dengesini koruyan, kompakt ama konforlu.",
    imageUrl: economicVilla,
    imageAlt: "Ekonomik villa konsepti için kompakt havuzlu villa",
    icon: BadgeDollarSign,
  },
  {
    slug: "jakuzili-villa",
    title: "Jakuzili Villa",
    description: "Konaklamaya spa rahatlığı katan jakuzili.",
    imageUrl: jacuzziVilla,
    imageAlt: "Jakuzili villa konsepti için spa hissi veren jakuzili oda",
    icon: Sparkles,
  },
];

export function VillaConceptsSection() {
  return (
    <section id="konseptler" className="container-shell py-12 lg:py-16">
      <div className="villawe-section-band villawe-gradient-band overflow-hidden rounded-[2.75rem] p-5 sm:p-7 lg:p-8 xl:p-10">
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:gap-6">
          <div className="villawe-panel relative flex min-h-[33rem] flex-col justify-between overflow-hidden rounded-[2.4rem] border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(245,250,250,0.9)_46%,rgba(231,244,244,0.72)_100%)] p-6 sm:p-8">
            <div className="space-y-5">
              <div className="space-y-4">
                <p className="section-kicker">Villa Konseptleri</p>
                <div className="space-y-3">
                  <h2 className="max-w-lg text-4xl font-semibold tracking-tight text-primary-dark sm:text-5xl">
                    Tatil tarzınıza göre seçin
                  </h2>
                  <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                    Her zevke uygun villa konseptleriyle benzersiz bir tatil deneyimi
                    yaşayın.
                  </p>
                </div>
              </div>

              <Link
                href="/villa-kiralama"
                className={buttonVariants({
                  className: "rounded-full px-6",
                })}
              >
                Tüm Konseptleri Keşfet
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="relative mt-8 overflow-hidden rounded-[2rem]">
              <div className="relative aspect-[4/3] min-h-[18rem]">
                <Image
                  src={featuredConceptVilla}
                  alt="Villa konseptleri için öne çıkan lüks havuzlu villa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 36vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,33,39,0.02)_0%,rgba(7,33,39,0.12)_34%,rgba(7,33,39,0.58)_100%)]" />

                <div className="absolute left-4 top-4 rounded-[1.4rem] border border-white/14 bg-white/92 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(7,33,39,0.28)] backdrop-blur-sm sm:left-5 sm:top-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-primary-dark text-white">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-primary-dark">
                        Güvenilir Kiralama
                      </p>
                      <p className="max-w-[14rem] text-xs leading-5 text-muted-foreground">
                        Doğrulanmış villa ve güvenli talep.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <div className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/82 backdrop-blur-sm">
                    Seçili Yaşam Tarzları
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {curatedConcepts.map((concept) => (
              <VillaConceptCard
                key={concept.slug}
                href={{
                  pathname: "/villa-kiralama",
                  query: { concept: concept.slug },
                }}
                title={concept.title}
                description={concept.description}
                imageUrl={concept.imageUrl}
                imageAlt={concept.imageAlt}
                icon={concept.icon}
                className="min-h-[15.5rem] sm:min-h-[16.5rem]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
