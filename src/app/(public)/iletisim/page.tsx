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
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="İletişim"
        title="Bize güvenle yazın"
        description="İlan güvenliği, villa listeleme talebi veya operasyonel destek için bizimle iletişime geçebilirsiniz."
      />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-7">
            <Input placeholder="Ad Soyad" />
            <Input type="email" placeholder="E-posta" />
            <Textarea rows={7} placeholder="Mesajınız" />
            <p className="text-sm text-muted-foreground">
              Form altyapısı hazırdır; üretim ortamında CRM veya destek akışına bağlanabilir.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-primary/10 bg-gradient-to-br from-primary-dark via-primary to-secondary text-primary-foreground shadow-[0_26px_70px_-34px_rgba(11,77,91,0.58)]">
          <CardContent className="space-y-4 p-7">
            <h2 className="text-3xl font-semibold tracking-tight">Güvenlik bildirimi</h2>
            <p className="text-sm leading-7 text-primary-foreground/80">
              Platform dışı ödeme talebi, sahte ekran görüntüsü veya şüpheli depozito yönlendirmesi alırsanız
              hemen bize bildirin.
            </p>
            <p className="text-sm leading-7 text-primary-foreground/80">
              E-posta: trust@villawe.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
