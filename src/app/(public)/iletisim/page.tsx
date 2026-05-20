import { Mail, ShieldAlert } from "lucide-react";

import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "İletişim | Villawe",
  description: "Villawe ile iletişime geçin, villa listeleme veya güvenlik bildirimlerinizi paylaşın.",
  path: "/iletisim",
});

export default function ContactPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="İletişim"
          title="Bize yazın"
          description="Villa listeleme, rezervasyon talebi veya güvenlik bildirimi için bize yazın."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="villawe-panel" id="listeleme">
          <CardContent className="space-y-4 p-7">
            <div className="space-y-2">
              <p className="section-kicker">İletişim Formu</p>
              <h2 className="text-3xl font-semibold tracking-tight">Mesaj bırakın</h2>
            </div>
            <Input placeholder="Ad Soyad" />
            <Input type="email" placeholder="E-posta" />
            <Textarea rows={7} placeholder="Mesajınız" />
            <p className="text-sm text-muted-foreground">
              Ekibimiz en kısa sürede dönüş yapar.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-[2rem] border-primary/10 bg-gradient-to-br from-primary-dark via-primary to-secondary text-primary-foreground shadow-[0_26px_70px_-34px_rgba(11,77,91,0.58)]">
            <CardContent className="space-y-4 p-7">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12 text-white">
                <ShieldAlert className="size-5" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">Güvenlik bildirimi</h2>
              <p className="text-sm leading-7 text-primary-foreground/80">
                Şüpheli ödeme talebi veya güven vermeyen bir yönlendirme görürseniz hemen bize bildirin.
              </p>
            </CardContent>
          </Card>

          <Card className="villawe-soft-panel">
            <CardContent className="space-y-3 p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_38px_-28px_rgba(18,110,130,0.24)]">
                <Mail className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">E-posta</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                trust@villawe.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
