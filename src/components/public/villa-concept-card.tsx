import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type VillaConceptCardProps = {
  href: ComponentProps<typeof Link>["href"];
  title: string;
  description: string;
  imageUrl: string | StaticImageData;
  imageAlt: string;
  icon: LucideIcon;
  className?: string;
};

export function VillaConceptCard({
  href,
  title,
  description,
  imageUrl,
  imageAlt,
  icon: Icon,
  className,
}: VillaConceptCardProps) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex min-h-[15rem] overflow-hidden rounded-[2rem] border border-white/12 bg-primary-dark shadow-[0_22px_60px_-38px_rgba(18,110,130,0.34)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(18,110,130,0.42)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 20vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,33,39,0.08)_0%,rgba(7,33,39,0.18)_34%,rgba(7,33,39,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(53,182,180,0.2),transparent_34%)]" />

      <div className="relative flex w-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-white/16 bg-white/12 text-white shadow-[0_18px_38px_-28px_rgba(7,33,39,0.5)] backdrop-blur-sm">
            <Icon className="size-4.5" />
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="max-w-[16rem] space-y-2">
            <h3 className="text-[1.55rem] font-semibold tracking-tight text-white sm:text-[1.7rem]">
              {title}
            </h3>
            <p className="max-w-[19rem] text-sm leading-6 text-white/76">
              {description}
            </p>
          </div>

          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/16">
            <ArrowUpRight className="size-4.5 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
