import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type RegionCardProps = {
  href: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string | undefined;
  className?: string | undefined;
};

export function RegionCard({
  href,
  name,
  description,
  imageUrl,
  imageAlt,
  eyebrow,
  className,
}: RegionCardProps) {
  return (
    <Link
      href={href as Route}
      className={cn(
        "group block overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_28px_72px_-44px_rgba(7,74,88,0.3)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_34px_84px_-44px_rgba(7,74,88,0.36)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[5/4]">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,53,63,0.08)_0%,rgba(7,53,63,0.2)_36%,rgba(7,53,63,0.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white sm:p-6">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-[2rem]">
                {name}
              </h3>
              <p className="max-w-sm text-sm leading-6 text-white/82">{description}</p>
            </div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white/84 backdrop-blur-sm transition group-hover:bg-white/16 group-hover:text-white">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
