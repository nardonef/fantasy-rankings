"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchFilterBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-[260px]">
      <Search className="pointer-events-none absolute top-1/2 left-[11px] size-[15px] -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search players"
        className="h-[34px] rounded-[10px] bg-transparent pl-[34px] text-[15px] dark:bg-transparent"
        aria-label="Search players"
      />
    </div>
  );
}
