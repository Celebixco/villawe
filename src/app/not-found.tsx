import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-12">
      <Card className="villawe-hero-surface max-w-2xl">
        <CardContent className="space-y-4 p-10 text-center">
          <p className="section-kicker">404</p>
          <h1 className="text-5xl font-semibold tracking-tight">Sayfa bulunamadı</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Aradığınız villa, bölge veya içerik şu anda erişilebilir değil.
          </p>
          <Link
            href="/"
            className={buttonVariants({
              className: "rounded-full",
            })}
          >
            Ana sayfaya dön
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
