import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarRange, ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/public/empty-state";
import type { AvailabilityBlockItem } from "@/features/villas/types";

type AvailabilityCalendarPreviewProps = {
  blocks: AvailabilityBlockItem[];
};

function formatRangeLabel(startDate: string, endDate: string) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${format(start, "d", { locale: tr })} - ${format(end, "d MMMM", { locale: tr })}`;
  }

  return `${format(start, "d MMM", { locale: tr })} - ${format(end, "d MMM", { locale: tr })}`;
}

function resolveBlockLabel(block: AvailabilityBlockItem) {
  switch (block.type) {
    case "maintenance":
      return "Bakım aralığı";
    case "hold":
      return "Bekleyen talep";
    case "reserved":
      return "Onaylı rezervasyon";
    case "owner_use":
      return "Özel kullanım";
    default:
      return block.label;
  }
}

export function AvailabilityCalendarPreview({
  blocks,
}: AvailabilityCalendarPreviewProps) {
  if (!blocks.length) {
    return (
      <EmptyState
        icon={<CalendarRange className="size-5" />}
        title="Açık blok görünmüyor"
        description="Takvim güncellemeleri talep öncesinde teyit edilir."
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
              <p className="text-sm font-semibold text-foreground">
                {formatRangeLabel(block.startDate, block.endDate)} arası kapalı
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {resolveBlockLabel(block)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
