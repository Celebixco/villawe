import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

const r2BaseUrl =
  process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

if (r2BaseUrl) {
  const url = new URL(r2BaseUrl);

  remotePatterns.push({
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    pathname: `${url.pathname.replace(/\/$/, "") || ""}/**`,
  });
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
};

export default nextConfig;
