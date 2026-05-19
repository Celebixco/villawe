import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  kicker: string;
  title: string;
  description: string;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "mx-auto max-w-4xl text-center" : "",
        className,
      )}
    >
      <p className="section-kicker">{kicker}</p>
      <div className="space-y-3">
        <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
