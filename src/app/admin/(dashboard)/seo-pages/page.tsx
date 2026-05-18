import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteSeoPageAction, saveSeoPageAction } from "@/features/admin/actions";
import {
  getAdminModuleState,
  getAdminSeoPages,
  getAdminSeoTargetOptions,
} from "@/features/admin/queries";

type AdminSeoPagesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSeoPagesPage({
  searchParams,
}: AdminSeoPagesPageProps) {
  const [moduleState, pages, targetOptions, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminSeoPages(),
    getAdminSeoTargetOptions(),
    searchParams,
  ]);
  const selectedId = typeof resolved.pageId === "string" ? resolved.pageId : undefined;
  const page = pages.find((item) => item.id === selectedId) || null;
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">SEO</p>
          <h2 className="text-4xl font-semibold tracking-tight">SEO iniş sayfaları</h2>
        </div>
        <Link href={{ pathname: "/admin/seo-pages", query: { new: "1" } }} className={buttonVariants({ className: "rounded-full" })}>
          Yeni SEO sayfası
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo SEO modu" : "SEO modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="SEO kaydı güncellendi" body="Sayfa bilgileri kaydedildi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {pages.length ? (
            pages.map((item) => (
              <Card key={item.id} className="villawe-panel">
                <CardContent className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">/{item.slug}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.pageType}
                      {item.targetEntityId ? ` · ${item.targetEntityId}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={{ pathname: "/admin/seo-pages", query: { pageId: item.id } }}
                      className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                    >
                      Düzenle
                    </Link>
                    <form action={deleteSeoPageAction}>
                      <input type="hidden" name="seoPageId" value={item.id} />
                      <Button type="submit" variant="outline" className="rounded-full">
                        Sil
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="villawe-soft-panel border-dashed">
              <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                Henüz SEO sayfası bulunmuyor.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={saveSeoPageAction} className="space-y-4">
              {page ? <input type="hidden" name="seoPageId" value={page.id} /> : null}
              <Input name="slug" defaultValue={page?.slug} placeholder="seo-slug" required />
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="pageType"
                  defaultValue={page?.pageType || "REGION"}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                >
                  <option value="REGION">REGION</option>
                  <option value="CONCEPT">CONCEPT</option>
                  <option value="LANDING">LANDING</option>
                  <option value="BLOG">BLOG</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
                <select
                  name="targetEntityId"
                  defaultValue={page?.targetEntityId || ""}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                >
                  <option value="">Hedef varlık seçin</option>
                  {targetOptions.map((option) => (
                    <option key={`${option.meta}-${option.id}`} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input name="title" defaultValue={page?.title} placeholder="SEO title" required />
              <Textarea name="description" defaultValue={page?.description} rows={4} placeholder="SEO description" required />
              <Input name="h1" defaultValue={page?.h1} placeholder="H1" />
              <Textarea name="intro" defaultValue={page?.intro} rows={4} placeholder="Intro" />
              <Textarea name="body" defaultValue={page?.body} rows={8} placeholder="Body copy" />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="canonicalPath" defaultValue={page?.canonicalPath} placeholder="/kanonik-yol" />
                <Input name="ogTitle" defaultValue={page?.ogTitle} placeholder="OG title" />
              </div>
              <Textarea name="ogDescription" defaultValue={page?.ogDescription} rows={4} placeholder="OG description" />
              <label className="villawe-check-tile">
                <input type="checkbox" name="noIndex" value="1" defaultChecked={page?.noIndex} />
                <span>noindex uygula</span>
              </label>
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  {page ? "SEO Sayfasını Kaydet" : "SEO Sayfası Oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
