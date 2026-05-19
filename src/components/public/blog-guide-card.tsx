import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { BlogPostRecord } from "@/features/villas/types";

type BlogGuideCardProps = {
  post: BlogPostRecord;
  imageUrl?: string | undefined;
};

export function BlogGuideCard({ post, imageUrl }: BlogGuideCardProps) {
  const resolvedImage = imageUrl || post.coverImage || "/images/villawe/blog-guide.svg";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_24px_60px_-40px_rgba(18,110,130,0.24)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_30px_74px_-38px_rgba(18,110,130,0.28)]"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={resolvedImage}
          alt={post.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Gezi Rehberi</Badge>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {post.publishedAt}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">{post.title}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:text-primary-dark">
          Yazıyı Oku
          <ArrowUpRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
