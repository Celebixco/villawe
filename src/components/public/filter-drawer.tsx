"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type FilterDrawerProps = {
  children: ReactNode;
};

export function FilterDrawer({ children }: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="rounded-full lg:hidden">
            <SlidersHorizontal className="size-4" />
            Filtreler
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[88vh] rounded-t-[2rem] border-t border-border bg-background">
        <SheetHeader className="border-b border-border/70 pb-4">
          <SheetTitle>Filtreler</SheetTitle>
          <SheetDescription>
            Size uygun villaları birkaç adımda daraltın.
          </SheetDescription>
        </SheetHeader>
        <div className="max-h-[calc(88vh-7rem)] overflow-y-auto py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
