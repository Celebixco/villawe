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
      <div className="relative overflow-hidden rounded-[2.1rem] border border-border/80 bg-card shadow-[0_28px_70px_-42px_rgba(18,110,130,0.24)]">
        <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[16/10]">
          <Image
            src={activeItem.url}
            alt={activeItem.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-primary-dark/86 via-primary-dark/14 to-transparent px-5 py-5 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/72">Fotoğraf Galerisi</p>
              <p className="mt-2 text-sm font-medium text-white/84">
                {media.length} görsel ile villa atmosferini inceleyin
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-xs font-semibold">
              <Camera className="size-3.5" />
              +{media.length}
            </div>
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
                "relative aspect-[5/4] overflow-hidden rounded-[1.35rem] border border-border/80 bg-card shadow-[0_12px_28px_-24px_rgba(18,110,130,0.24)] transition duration-200",
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
                  +{extraCount} Fotoğraf
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
