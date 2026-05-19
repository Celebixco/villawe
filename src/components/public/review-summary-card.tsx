import { MessageSquareQuote, Star } from "lucide-react";

import { EmptyState } from "@/components/public/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewRecord } from "@/features/villas/types";

type ReviewSummaryCardProps = {
  reviews: ReviewRecord[];
};

export function ReviewSummaryCard({ reviews }: ReviewSummaryCardProps) {
  if (!reviews.length) {
    return (
      <EmptyState
        icon={<MessageSquareQuote className="size-5" />}
        title="Henüz doğrulanmış yorum yok"
        description="İlk konuk değerlendirmeleri yayınlandığında bu alanda puan ve deneyim özetleri görünecek."
      />
    );
  }

  const average =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-5">
      <Card className="villawe-panel">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="section-kicker">Konuk Değerlendirmeleri</p>
            <h3 className="text-3xl font-semibold tracking-tight">
              Ortalama {average.toFixed(1)} / 5 puan
            </h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Yalnızca onaylanmış konaklama yorumları gösterilir.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/10 px-4 py-2 text-sm font-semibold text-foreground">
            <Star className="size-4 fill-warning text-warning" />
            {reviews.length} yorum
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {reviews.slice(0, 4).map((review) => (
          <Card key={review.id} className="villawe-panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{review.authorName}</p>
                  <p className="text-sm text-muted-foreground">{review.stayDate}</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
                  <Star className="size-3.5 fill-warning text-warning" />
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-semibold tracking-tight">{review.title}</h4>
                <p className="text-sm leading-7 text-muted-foreground">{review.body}</p>
              </div>
              {review.reply ? (
                <div className="rounded-[1.25rem] border border-border/70 bg-muted/72 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {review.reply.responder}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {review.reply.body}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
