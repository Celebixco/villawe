import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, MapPin } from "lucide-react";

type RegionCardProps = {
  href: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string | undefined;
};

export function RegionCard({
  href,
  name,
  description,
  imageUrl,
  imageAlt,
  eyebrow,
}: RegionCardProps) {
  return (
    <Link
      href={href as Route}
      className="group block overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_24px_60px_-40px_rgba(18,110,130,0.26)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_28px_70px_-36px_rgba(18,110,130,0.32)]"
    >
      <div className="relative aspect-[4/4.6] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/92 via-primary-dark/28 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white">
          {eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/84">
              <MapPin className="size-3.5" />
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-3xl font-semibold tracking-tight">{name}</h3>
              <ArrowUpRight className="mt-1 size-5 shrink-0 text-white/74 transition group-hover:text-white" />
            </div>
            <p className="max-w-xs text-sm leading-7 text-white/78">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
