import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  canonicalPath?: string | undefined;
  openGraphTitle?: string | undefined;
  openGraphDescription?: string | undefined;
  noIndex?: boolean | undefined;
};

export function buildAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url);
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  canonicalPath,
  openGraphTitle,
  openGraphDescription,
  noIndex,
}: MetadataInput): Metadata {
  const canonicalUrl = buildAbsoluteUrl(canonicalPath || path);
  const imageUrl = buildAbsoluteUrl(image || siteConfig.socialImage);
  const graphTitle = openGraphTitle || title;
  const graphDescription = openGraphDescription || description;

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: siteConfig.name,
      url: canonicalUrl,
      title: graphTitle,
      description: graphDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: graphTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: graphTitle,
      description: graphDescription,
      images: [imageUrl.toString()],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path).toString(),
    })),
  };
}
