import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  saveReviewReplyAction,
  updateReviewStatusAction,
} from "@/features/admin/actions";
import { getAdminModuleState, getAdminReviews } from "@/features/admin/queries";

type AdminReviewsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const [moduleState, reviews, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminReviews(),
    searchParams,
  ]);
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Yorumlar</p>
        <h2 className="text-4xl font-semibold tracking-tight">Yorum moderasyonu</h2>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo review modu" : "Yorum modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="Yorum güncellendi" body="Moderasyon işlemi kaydedildi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="space-y-4">
        {reviews.length ? (
          reviews.map((review) => (
            <Card key={review.id} className="villawe-panel">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{review.villaTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {review.authorName} · {review.rating}/5 · {review.status}
                    </p>
                  </div>
                  <form action={updateReviewStatusAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <select
                      name="status"
                      defaultValue={review.status}
                      className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                    >
                      {["PENDING", "APPROVED", "REJECTED", "HIDDEN"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline" className="rounded-full">
                      Moderasyonu Kaydet
                    </Button>
                  </form>
                </div>

                {review.title ? <p className="font-semibold">{review.title}</p> : null}
                <p className="text-sm leading-7 text-muted-foreground">{review.body}</p>

                <form action={saveReviewReplyAction} className="villawe-soft-block space-y-3">
                  <input type="hidden" name="reviewId" value={review.id} />
                  {review.reply ? <input type="hidden" name="replyId" value={review.reply.id} /> : null}
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      name="responderType"
                      defaultValue={review.reply?.responderType || "ADMIN"}
                      className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                    <Button type="submit" variant="outline" className="rounded-full">
                      Yanıtı Kaydet
                    </Button>
                  </div>
                  <textarea
                    name="body"
                    defaultValue={review.reply?.body}
                    rows={4}
                    placeholder="Villawe veya owner yanıtı"
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm"
                    required
                  />
                </form>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="villawe-soft-panel border-dashed">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              Henüz moderasyon bekleyen yorum bulunmuyor.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
