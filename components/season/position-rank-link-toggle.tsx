"use client";

import { useTransition } from "react";
import { setPositionRankLinked } from "@/app/actions/seasons";
import { Button } from "@/components/ui/button";

export function PositionRankLinkToggle({
  seasonId,
  seasonYear,
  linked,
}: {
  seasonId: number;
  seasonYear: number;
  linked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      setPositionRankLinked({ seasonId, seasonYear, linked: !linked });
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-2 px-1 font-mono text-[11px] tracking-[0.14em] uppercase text-chalk-dim hover:bg-transparent"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={linked}
      title={
        linked
          ? "Position ranks follow the overall order. Click to rank each position independently instead."
          : "Position ranks are independent of the overall order. Click to derive them from overall instead."
      }
    >
      <span
        aria-hidden
        className={`relative h-[14px] w-[24px] shrink-0 rounded-full transition-colors ${linked ? "bg-rankings" : "bg-hairline-2"}`}
      >
        <span
          className={`absolute top-[2px] size-[10px] rounded-full bg-chalk transition-all ${linked ? "left-[12px]" : "left-[2px]"}`}
        />
      </span>
      <span className="sm:hidden">
        {isPending ? "Updating…" : linked ? "Linked" : "Independent"}
      </span>
      <span className="hidden sm:inline">
        {isPending
          ? "Updating…"
          : linked
            ? "Pos ranks linked"
            : "Pos ranks independent"}
      </span>
    </Button>
  );
}
