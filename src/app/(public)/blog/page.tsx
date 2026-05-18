import Link from "next/link";

import { SectionHeading } from "@/components/public/section-heading";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
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

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Seyahat Rehberi"
        title="Villawe blog"
        description="Bölge rehberleri, güvenli kiralama notları ve tatil planını kolaylaştıran net içerikler."
      />
      {databaseHealth.status === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Demo içerik akışı"
          body={`${databaseHealth.message} Blog listesi development ortamındaki örnek içeriklerle gösteriliyor.`}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.slug} className="villawe-panel">
            <CardContent className="space-y-4 p-7">
              <p className="text-sm text-muted-foreground">{post.publishedAt}</p>
              <h2 className="text-3xl font-semibold tracking-tight">{post.title}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-primary">
                Yazıyı oku
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
