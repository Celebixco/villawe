"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Images } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VillaMediaItem } from "@/features/villas/types";

type VillaGalleryProps = {
  title: string;
  items: VillaMediaItem[];
};

export function VillaGallery({ title, items }: VillaGalleryProps) {
  const media = useMemo(
    () =>
      items.length
        ? items
        : [
            {
              id: "fallback-gallery",
              url: "/images/villawe/villa-fallback.svg",
              alt: title,
              isCover: true,
            },
          ],
    [items, title],
  );
  const [activeId, setActiveId] = useState(media[0]?.id);
  const activeItem = media.find((item) => item.id === activeId) ?? media[0]!;
  const previewItems = media.slice(0, 5);
  const extraCount = Math.max(media.length - previewItems.length, 0);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-border/80 bg-card shadow-[0_34px_90px_-48px_rgba(18,110,130,0.28)]">
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
          <Image
            src={activeItem.url}
            alt={activeItem.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary-dark/76 via-primary-dark/12 to-transparent" />
          <div className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/12 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <Camera className="size-3.5" />
            {media.length} fotoğraf
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {previewItems.map((item, index) => {
          const isActive = item.id === activeItem.id;
          const showOverlay = extraCount > 0 && index === previewItems.length - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "relative aspect-[5/4] overflow-hidden rounded-[1.45rem] border border-border/80 bg-card shadow-[0_14px_34px_-28px_rgba(18,110,130,0.22)] transition duration-200",
                isActive ? "ring-2 ring-primary/35" : "hover:-translate-y-0.5 hover:border-primary/20",
              )}
              aria-label={`${title} görselini göster: ${item.alt}`}
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 18vw"
              />
              {showOverlay ? (
                <span className="absolute inset-0 flex items-center justify-center bg-primary-dark/68 text-sm font-semibold text-white">
                  <Images className="mr-2 size-4" />
                  +{extraCount} daha
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
