export const siteConfig = {
  name: "Villawe",
  domain: "villawe.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://villawe.com",
  description:
    "Villawe, doğrulanmış ve şeffaf villa kiralama deneyimi için güven odaklı premium keşif ve rezervasyon talep platformudur.",
  defaultLocale: "tr-TR",
  socialImage: "/images/villawe/og-default.svg",
  publicNavigation: [
    { href: "/villa-kiralama", label: "Villalar" },
    { href: "/guvenli-villa-kiralama-rehberi", label: "Güvenli Kiralama Rehberi" },
    { href: "/blog", label: "Gezi Rehberi" },
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/iletisim", label: "İletişim" },
  ],
  adminNavigation: [
    { href: "/admin", label: "Genel Bakış" },
    { href: "/admin/villas", label: "Villa Yönetimi" },
    { href: "/admin/inquiries", label: "Talepler" },
    { href: "/admin/reviews", label: "Yorumlar" },
    { href: "/admin/owners", label: "Sahipler & Acenteler" },
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/seo-pages", label: "SEO Sayfaları" },
    { href: "/admin/redirects", label: "Yönlendirmeler" },
    { href: "/admin/settings", label: "Ayarlar" },
    { href: "/admin/audit-logs", label: "Audit Log" },
  ],
} as const;

export type PublicNavigationItem = (typeof siteConfig.publicNavigation)[number];
export type AdminNavigationItem = (typeof siteConfig.adminNavigation)[number];
