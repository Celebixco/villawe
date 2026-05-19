import { CalendarRange, ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/public/empty-state";
import type { AvailabilityBlockItem } from "@/features/villas/types";

type AvailabilityCalendarPreviewProps = {
  blocks: AvailabilityBlockItem[];
};

export function AvailabilityCalendarPreview({
  blocks,
}: AvailabilityCalendarPreviewProps) {
  if (!blocks.length) {
    return (
      <EmptyState
        icon={<CalendarRange className="size-5" />}
        title="Aktif blok görünmüyor"
        description="Bu villa için açık bir blok görünmüyor. Kesin müsaitlik teyidi için talep gönderdiğinizde çakışma kontrolü yapılır."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {blocks.map((block) => (
        <div
          key={`${block.startDate}-${block.endDate}-${block.type}`}
          className="rounded-[1.5rem] border border-border/70 bg-muted/72 px-4 py-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-card text-warning shadow-[0_14px_28px_-24px_rgba(232,165,48,0.28)]">
              <ShieldAlert className="size-4" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{block.label}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">
                {block.type.replaceAll("_", " ")}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {block.startDate} - {block.endDate}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
