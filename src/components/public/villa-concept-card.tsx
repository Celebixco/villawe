import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type VillaConceptCardProps = {
  href: string;
  title: string;
  description: string;
  imageUrl?: string | undefined;
  imageAlt?: string | undefined;
  Icon: LucideIcon;
  className?: string | undefined;
};

export function VillaConceptCard({
  href,
  title,
  description,
  imageUrl,
  imageAlt,
  Icon,
  className,
}: VillaConceptCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[15.5rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(69,194,210,0.22),transparent_38%),linear-gradient(145deg,rgba(7,53,63,0.98)_0%,rgba(7,74,88,0.96)_50%,rgba(11,96,114,0.92)_100%)] shadow-[0_30px_72px_-44px_rgba(7,53,63,0.65)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_34px_86px_-42px_rgba(7,53,63,0.72)]",
        className,
      )}
    >
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,43,51,0.12)_0%,rgba(6,43,51,0.4)_34%,rgba(6,43,51,0.94)_100%)]" />
        </>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(145,227,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(69,194,210,0.18),transparent_30%)]" />
      <div className="relative flex w-full flex-col justify-between p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/88 backdrop-blur-sm">
            <Icon className="size-[18px]" />
          </span>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="max-w-[13rem] text-[1.45rem] font-semibold tracking-tight text-balance">
              {title}
            </h3>
            <p className="max-w-[15rem] text-sm leading-6 text-white/78">{description}</p>
          </div>
          <div className="flex items-center justify-end">
            <span className="flex size-11 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/88 backdrop-blur-sm transition group-hover:bg-white/16 group-hover:text-white">
              <ArrowUpRight className="size-[18px] transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
