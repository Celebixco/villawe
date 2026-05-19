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
  description: "Villawe gezi rehberi ve güven odaklı içerik merkezi.",
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
          title="Villawe blog"
          description="Bölge rehberleri, güvenli kiralama notları ve tatil planını kolaylaştıran açık içerikler."
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
          title="Demo içerik akışı"
          body={`${databaseHealth.message} Blog listesi development ortamındaki örnek içeriklerle gösteriliyor.`}
        />
      ) : null}

      {featuredPost ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <BlogGuideCard post={featuredPost} />
          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-7">
              <p className="section-kicker">Editör Notu</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Tatil planı kadar güvenli karar akışına da odaklanıyoruz
              </h2>
              <p className="text-sm leading-8 text-muted-foreground">
                Villawe rehberi yalnızca destinasyon ilhamı üretmez; kapora, doğrulama ve
                fiyat şeffaflığı gibi karar anında kritik olan konuları da ele alır.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="Blog içerikleri yakında yayında"
          description="İlk gezi rehberleri ve güvenli kiralama yazıları eklendiğinde burada görünecek."
        />
      )}

      {secondaryPosts.length ? (
        <section className="space-y-6">
          <SectionHeading
            kicker="Son Yazılar"
            title="Okumaya devam edin"
            description="Bölge ipuçları, villa seçimi ve güvenli talep sürecine dair diğer içerikler."
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
