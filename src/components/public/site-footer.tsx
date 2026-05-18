import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="mt-20 pb-8">
      <div className="container-shell">
        <div className="rounded-[2.25rem] bg-primary-dark text-white shadow-[0_30px_70px_-36px_rgba(11,77,91,0.75)]">
          <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.25fr_0.85fr_0.85fr] lg:px-10 lg:py-12">
            <div className="space-y-4">
              <p className="text-2xl font-semibold tracking-tight">villawe</p>
              <p className="max-w-md text-sm leading-7 text-white/74">
                Güvenilir, doğrulanmış ve size özel villalar Villawe’de sizi bekliyor.
                Şeffaf fiyatlandırma, gerçek doğrulama rozetleri ve güvenli talep akışı
                platformun temelidir.
              </p>
              <div className="flex flex-wrap gap-2">
                {["%100 Güvenli", "Şeffaf Fiyatlandırma", "7/24 Destek"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-medium text-white/86"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
                Hızlı Erişim
              </p>
              <div className="flex flex-col gap-2 text-sm text-white/78">
                <Link href="/villa-kiralama" className="transition hover:text-white">
                  Villa Arama
                </Link>
                <Link href="/guvenli-villa-kiralama-rehberi" className="transition hover:text-white">
                  Güvenli Kiralama Rehberi
                </Link>
                <Link href="/iptal-ve-depozito-politikasi" className="transition hover:text-white">
                  İptal ve Depozito Politikası
                </Link>
                <Link href="/sss" className="transition hover:text-white">
                  Sık Sorulan Sorular
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
                Kurumsal
              </p>
              <div className="flex flex-col gap-2 text-sm text-white/78">
                <Link href="/hakkimizda" className="transition hover:text-white">
                  Hakkımızda
                </Link>
                <Link href="/iletisim" className="transition hover:text-white">
                  İletişim
                </Link>
                <Link href="/blog" className="transition hover:text-white">
                  Gezi Rehberi
                </Link>
                <Link href="/admin/login" className="transition hover:text-white">
                  Admin
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-6 py-4 text-xs text-white/60 sm:px-8 lg:px-10">
            © {new Date().getFullYear()} {siteConfig.domain} · Güvenli villa keşfi ve rezervasyon talep platformu
          </div>
        </div>
      </div>
    </footer>
  );
}
