import type { Metadata } from "next";
import { IBM_Plex_Mono, Poppins } from "next/font/google";

import { buildMetadata } from "@/features/seo/metadata";
import "./globals.css";

const brandFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: "Villawe",
  description:
    "Villawe, doğrulanmış villa ilanları ve şeffaf rezervasyon talepleri için güven odaklı premium villa kiralama platformudur.",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${brandFont.variable} ${monoFont.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
