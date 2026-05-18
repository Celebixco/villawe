import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { getBlogPostBySlug } from "@/features/villas/queries";
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
  const [databaseHealth, post] = await Promise.all([
    getDatabaseHealth(),
    getBlogPostBySlug(slug),
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

  return (
    <div className="container-shell py-12">
      <Card className="villawe-panel">
        <CardContent className="space-y-6 p-8">
          <p className="section-kicker">Blog</p>
          <h1 className="text-5xl font-semibold tracking-tight text-balance">{post.title}</h1>
          <p className="text-sm text-muted-foreground">{post.publishedAt}</p>
          <p className="text-base leading-8 text-muted-foreground">{post.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
