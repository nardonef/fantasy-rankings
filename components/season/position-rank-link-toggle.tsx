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
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={linked}
      title={
        linked
          ? "Position ranks follow the overall order. Click to rank each position independently instead."
          : "Position ranks are independent of the overall order. Click to derive them from overall instead."
      }
    >
      {isPending
        ? "Updating…"
        : linked
          ? "Position ranks: linked"
          : "Position ranks: independent"}
    </Button>
  );
}
