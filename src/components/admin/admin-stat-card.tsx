import { Card, CardContent } from "@/components/ui/card";

type AdminStatCardProps = {
  label: string;
  value: number | string;
  description: string;
  tone?: "primary" | "secondary" | "success" | "warning" | "error";
};

const toneMap = {
  primary: "from-primary/12 to-primary/4 text-primary-dark",
  secondary: "from-secondary/16 to-secondary/5 text-primary-dark",
  success: "from-success/16 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-foreground",
  error: "from-destructive/14 to-destructive/4 text-destructive",
} as const;

export function AdminStatCard({
  label,
  value,
  description,
  tone = "primary",
}: AdminStatCardProps) {
  return (
    <Card className="villawe-panel">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <div className={`rounded-[1.35rem] bg-gradient-to-br px-4 py-4 ${toneMap[tone]}`}>
          <p className="text-4xl font-semibold tracking-tight">{value}</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
