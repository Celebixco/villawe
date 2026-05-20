import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { demoPolicies } from "@/lib/demo-data";

export const metadata = buildMetadata({
  title: "SSS | Villawe",
  description: "Villawe sık sorulan sorular sayfası.",
  path: "/sss",
});

export default function FaqPage() {
  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Sık Sorulan Sorular"
          title="Kısa yanıtlarla SSS"
          description="Villawe deneyimine dair en temel sorular."
        />
      </section>

      <div className="space-y-4">
        {demoPolicies.faqs.map((faq) => (
          <Card key={faq.question} className="villawe-panel">
            <CardContent className="space-y-3 p-7">
              <h2 className="text-2xl font-semibold tracking-tight">{faq.question}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
