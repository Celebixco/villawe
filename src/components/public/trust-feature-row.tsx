import type { LucideIcon } from "lucide-react";

type TrustFeature = {
  label: string;
  description?: string;
  icon: LucideIcon;
  accentClassName: string;
};

type TrustFeatureRowProps = {
  items: TrustFeature[];
};

export function TrustFeatureRow({ items }: TrustFeatureRowProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="villawe-soft-panel flex items-start gap-4 px-4 py-4 sm:px-5"
          >
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card ${item.accentClassName}`}>
              <Icon className="size-5" />
            </div>
            <div className={item.description ? "space-y-1" : ""}>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              {item.description ? (
                <p className="text-xs leading-6 text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
