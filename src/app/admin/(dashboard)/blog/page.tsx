import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteBlogPostAction, saveBlogPostAction } from "@/features/admin/actions";
import { getAdminBlogPosts, getAdminModuleState } from "@/features/admin/queries";

type AdminBlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const [moduleState, posts, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminBlogPosts(),
    searchParams,
  ]);
  const selectedPostId = typeof resolved.postId === "string" ? resolved.postId : undefined;
  const post = posts.find((item) => item.id === selectedPostId) || null;
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Blog Yönetimi</p>
          <h2 className="text-4xl font-semibold tracking-tight">Blog yönetimi</h2>
        </div>
        <Link href={{ pathname: "/admin/blog", query: { new: "1" } }} className={buttonVariants({ className: "rounded-full" })}>
          Yeni yazı
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo blog modu" : "Blog modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="Yazı kaydedildi" body="Blog kaydı güncellendi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {posts.length ? (
            posts.map((item) => (
              <Card key={item.id} className="villawe-panel">
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.status} · /blog/{item.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={{ pathname: "/admin/blog", query: { postId: item.id } }}
                        className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                      >
                        Düzenle
                      </Link>
                      <form action={deleteBlogPostAction}>
                        <input type="hidden" name="postId" value={item.id} />
                        <Button type="submit" variant="outline" className="rounded-full">
                          Sil
                        </Button>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{item.excerpt}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="villawe-soft-panel border-dashed">
              <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                Henüz blog yazısı bulunmuyor.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={saveBlogPostAction} className="space-y-4">
              {post ? <input type="hidden" name="postId" value={post.id} /> : null}
              <Input name="title" defaultValue={post?.title} placeholder="Yazı başlığı" required />
              <Input name="slug" defaultValue={post?.slug} placeholder="yazi-slug" required />
              <Textarea name="excerpt" defaultValue={post?.excerpt} rows={4} placeholder="Özet" required />
              <Textarea name="content" defaultValue={post?.content} rows={12} placeholder="İçerik" required />
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="status"
                  defaultValue={post?.status || "DRAFT"}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <Input name="seoTitle" defaultValue={post?.seoTitle} placeholder="SEO title" />
              </div>
              <Textarea name="seoDescription" defaultValue={post?.seoDescription} rows={4} placeholder="SEO description" />
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  {post ? "Yazıyı Kaydet" : "Yazı Oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
