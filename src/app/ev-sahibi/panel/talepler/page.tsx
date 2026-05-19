import type { Route } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";
import { getOwnerInquirySummaries } from "@/features/owners/queries";

export default async function OwnerInquiriesPage() {
  const session = await requireOwnerSession();
  const inquiries = await getOwnerInquirySummaries(session.ownerId);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Talepler</p>
        <h2 className="text-4xl font-semibold tracking-tight">Villa talepleri</h2>
      </div>

      {inquiries.length ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="villawe-panel">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold tracking-tight">{inquiry.villaTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {inquiry.fullName} · {inquiry.guestCount} misafir
                    {inquiry.startDate ? ` · ${inquiry.startDate}` : ""}
                    {inquiry.endDate ? ` - ${inquiry.endDate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="villawe-status-chip">{inquiry.status}</span>
                  <Link
                    href={`/ev-sahibi/panel/talepler/${inquiry.id}` as Route}
                    className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                  >
                    Detay
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="villawe-soft-panel border-dashed">
          <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
            Henüz görüntülenecek talep bulunmuyor.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
