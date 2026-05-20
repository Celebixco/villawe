import Link from "next/link";

import { BlogGuideCard } from "@/components/public/blog-guide-card";
import { EmptyState } from "@/components/public/empty-state";
import { SectionHeading } from "@/components/public/section-heading";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { getBlogPosts } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Blog | Villawe",
  description: "Villawe rehberi, bölge notları ve güvenli tatil planı için editoryal içerikler.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const [databaseHealth, posts] = await Promise.all([
    getDatabaseHealth(),
    getBlogPosts(),
  ]);

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Seyahat Rehberi"
          title="Villawe rehberi"
          description="Bölge notları ve güvenli tatil planı için kısa içerikler."
          action={
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Villaları Keşfet
            </Link>
          }
        />
      </section>

      {databaseHealth.status === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Örnek içerik akışı"
          body="Rehber sayfası geçici örnek içerikler gösterebilir."
        />
      ) : null}

      {featuredPost ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <BlogGuideCard post={featuredPost} />
          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-7">
              <p className="section-kicker">Editör Notu</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Tatil planını kolaylaştıran kısa notlar
              </h2>
              <p className="text-sm leading-8 text-muted-foreground">
                Villawe rehberi; bölge seçimi, fiyat netliği ve talep süreci gibi karar anını etkileyen başlıklara odaklanır.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="Rehber seçkisi kısa süre içinde genişleyecek"
          description="Yeni yazılar eklendikçe bu alanda görünmeye devam edecek."
        />
      )}

      {secondaryPosts.length ? (
        <section className="space-y-6">
          <SectionHeading
            kicker="Son Yazılar"
            title="Okumaya devam edin"
            description="Bölge seçiminden talep sürecine kadar diğer içerikler."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {secondaryPosts.map((post) => (
              <BlogGuideCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
