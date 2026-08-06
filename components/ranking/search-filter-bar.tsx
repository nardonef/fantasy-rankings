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
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name or team…"
        className="pl-8"
        aria-label="Search players"
      />
    </div>
  );
}
