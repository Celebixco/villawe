"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type OwnerSidebarProps = {
  fullName: string;
  statusLabel: string;
};

export function OwnerSidebar({ fullName, statusLabel }: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 h-fit rounded-[2rem] border border-border/80 bg-card p-5 shadow-[0_20px_54px_-38px_rgba(18,110,130,0.18)]">
      <div className="space-y-1 border-b border-border/70 pb-5">
        <p className="text-sm text-muted-foreground">Villawe Ev Sahibi Paneli</p>
        <p className="text-xl font-semibold tracking-tight text-primary-dark">{fullName}</p>
        <p className="text-sm text-muted-foreground">{statusLabel}</p>
      </div>
      <nav className="mt-5 flex flex-col gap-2">
        {siteConfig.ownerNavigation.map((item) => {
          const active =
            item.href === "/ev-sahibi/panel"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-dark text-white shadow-[0_14px_28px_-20px_rgba(11,77,91,0.85)]"
                  : "text-foreground/82 hover:bg-muted hover:text-primary-dark",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
