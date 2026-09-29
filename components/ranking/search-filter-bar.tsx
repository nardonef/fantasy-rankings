"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchFilterBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full sm:w-[280px]">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name or team…"
        className="h-[38px] rounded-[9px] border-[#262633] bg-input-bg pl-8 pr-8 placeholder:text-[#4a4a58] dark:bg-input-bg"
        aria-label="Search players"
      />
      <kbd
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-[4px] border border-hairline-2 px-1 font-mono text-[10px] text-chalk-faint sm:block"
      >
        /
      </kbd>
    </div>
  );
}
