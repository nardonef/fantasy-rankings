"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function NotesEditor({
  notes,
  onSave,
}: {
  notes: string | null;
  onSave: (notes: string) => void;
}) {
  const [value, setValue] = useState(notes ?? "");
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && value !== (notes ?? "")) {
      onSave(value);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit notes"
          className={cn(
            "text-[oklch(0.4_0_0)]",
            notes && notes.length > 0 && "text-foreground",
          )}
        >
          <StickyNote className="size-[15px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Notes…"
          rows={4}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
