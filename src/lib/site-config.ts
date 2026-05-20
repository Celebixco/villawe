export const siteConfig = {
  name: "Villawe",
  domain: "villawe.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://villawe.com",
  description:
    "Doğrulanmış villalar, net fiyatlar ve güvenli talep akışı Villawe'de buluşur.",
  defaultLocale: "tr-TR",
  socialImage: "/images/villawe/og-default.svg",
  publicNavigation: [
    { href: "/villa-kiralama", label: "Villalar" },
    { href: "/#bolgeler", label: "Bölgeler" },
    { href: "/#konseptler", label: "Konseptler" },
    { href: "/blog", label: "Rehber" },
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
