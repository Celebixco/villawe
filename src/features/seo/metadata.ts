import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function buildAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url);
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: MetadataInput): Metadata {
  const absoluteUrl = buildAbsoluteUrl(path);
  const imageUrl = buildAbsoluteUrl(image || siteConfig.socialImage);

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: siteConfig.name,
      url: absoluteUrl,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
