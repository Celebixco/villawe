import type { MetadataRoute } from "next";

import {
  getBlogPosts,
  getPublishedVillaSlugs,
  getSeoTargets,
} from "@/features/villas/queries";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/villa-kiralama",
    "/hakkimizda",
    "/iletisim",
    "/guvenli-villa-kiralama-rehberi",
    "/sss",
    "/iptal-ve-depozito-politikasi",
    "/blog",
  ];

  const [blogPosts, seoTargets, villaSlugs] = await Promise.all([
    getBlogPosts(),
    getSeoTargets(),
    getPublishedVillaSlugs(),
  ]);
  const blogPages = blogPosts.map((post) => `/blog/${post.slug}`);
  const seoPages = seoTargets.map((target) => `/${target.slug}`);
  const villaPages = villaSlugs.map((slug) => `/villalar/${slug}`);

  return [...staticPages, ...blogPages, ...seoPages, ...villaPages].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
