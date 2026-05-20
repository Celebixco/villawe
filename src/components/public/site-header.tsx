"use client";

import Link from "next/link";
import { Heart, Menu, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/55 bg-background/84 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-primary to-secondary text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-20px_rgba(18,110,130,0.8)]">
            vw
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-semibold tracking-tight text-primary-dark">villawe</p>
            <p className="text-xs text-muted-foreground">Seçkin villa seçkisi</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.publicNavigation.map((item) => {
            const pathWithoutHash = item.href.split("#")[0] || "";
            const active =
              pathWithoutHash.length > 1 &&
              (pathname === pathWithoutHash || pathname.startsWith(`${pathWithoutHash}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-primary-dark"
                    : "text-foreground/80 hover:bg-muted/80 hover:text-primary-dark",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/favoriler"
            aria-label="Favori villalar"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "rounded-full",
            })}
          >
            <Heart className="size-4" />
          </Link>
          <Link
            href="/iletisim#listeleme"
            className={buttonVariants({
              variant: "accent",
              className: "rounded-full px-6",
            })}
          >
            Villanızı Listeleyin
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Menüyü aç"
                className="rounded-2xl shadow-[0_10px_24px_-18px_rgba(18,110,130,0.45)] lg:hidden"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-border bg-card">
            <SheetHeader className="border-b border-border/70 pb-5">
              <SheetTitle className="flex items-center gap-2 text-primary-dark">
                <Sparkles className="size-4 text-accent" />
                villawe
              </SheetTitle>
              <SheetDescription>
                Seçkin villaları sade ve güvenli bir akışla keşfedin.
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-2 px-4 pb-4">
              {siteConfig.publicNavigation.map((item) => {
                const pathWithoutHash = item.href.split("#")[0] || "";
                const active =
                  pathWithoutHash.length > 1 &&
                  (pathname === pathWithoutHash || pathname.startsWith(`${pathWithoutHash}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-primary-dark"
                        : "text-foreground hover:bg-muted/85 hover:text-primary-dark",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-4 grid gap-3">
                <Link
                  href="/villa-kiralama"
                  className={buttonVariants({
                    className: "w-full rounded-full",
                  })}
                >
                  Villaları Keşfet
                </Link>
                <Link
                  href="/favoriler"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full rounded-full",
                  })}
                >
                  Favoriler
                </Link>
                <Link
                  href="/iletisim#listeleme"
                  className={buttonVariants({
                    variant: "accent",
                    className: "w-full rounded-full",
                  })}
                >
                  Villanızı Listeleyin
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
