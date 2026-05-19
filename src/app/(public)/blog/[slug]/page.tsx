import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogGuideCard } from "@/components/public/blog-guide-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { getBlogPostBySlug, getBlogPosts } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [databaseHealth, post] = await Promise.all([
    getDatabaseHealth(),
    getBlogPostBySlug(slug),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return buildMetadata({
      title: "İçerik geçici olarak kullanılamıyor | Villawe",
      description: "Blog içeriği şu anda yüklenemiyor.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  if (!post) {
    return buildMetadata({
      title: "Yazı bulunamadı | Villawe",
      description: "Aradığınız blog yazısı bulunamadı.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: post.seoTitle || `${post.title} | Villawe`,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [databaseHealth, post, posts] = await Promise.all([
    getDatabaseHealth(),
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return (
      <div className="container-shell py-12">
        <DataSourceNotice
          tone="error"
          title="İçerik merkezi geçici olarak kullanılamıyor"
          body="Veritabanı bağlantısı tekrar sağlandığında blog yazıları gerçek içerikle gösterilecektir."
        />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const relatedPosts = posts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const contentParagraphs = post.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <article className="space-y-8">
        <div className="space-y-4">
          <Link href="/blog" className="section-kicker inline-block">
            Blog / Rehber
          </Link>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            {post.title}
          </h1>
          <p className="text-sm text-muted-foreground">{post.publishedAt}</p>
        </div>

        <div className="villawe-image-shell relative">
          <div className="relative aspect-[16/8.8] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="villawe-panel">
            <CardContent className="space-y-5 p-7 sm:p-9">
              <p className="text-lg leading-8 text-foreground">{post.excerpt}</p>
              <div className="space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
                {contentParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="villawe-soft-panel">
              <CardContent className="space-y-4 p-6">
                <p className="section-kicker">Villawe Rehberi</p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Tatil kararını daha güvenli verin
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Rehber içerikleri, bölge ilhamı ile güvenli kiralama bilgisini aynı çizgide sunar.
                </p>
                <Link
                  href="/villa-kiralama"
                  className={buttonVariants({
                    variant: "outline",
                    className: "rounded-full",
                  })}
                >
                  Villaları Keşfet
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>

      {relatedPosts.length ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="section-kicker">İlgili Yazılar</p>
            <h2 className="text-4xl font-semibold tracking-tight">Okumaya devam edin</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <BlogGuideCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
