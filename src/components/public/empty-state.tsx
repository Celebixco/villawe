import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card className="villawe-soft-panel border-dashed">
      <CardContent className="space-y-4 p-8 text-center sm:p-10">
        {icon ? (
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_40px_-28px_rgba(18,110,130,0.25)]">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
          <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
