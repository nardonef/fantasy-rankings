"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { setPositionRankLinked } from "@/app/actions/seasons";
import { NewSeasonDialog } from "@/components/season/new-season-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Season = { id: number; year: number };

export function SeasonMenu({
  seasons,
  currentYear,
  seasonId,
  positionRankLinked,
}: {
  seasons: Season[];
  currentYear: number;
  seasonId: number;
  positionRankLinked: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [newSeasonOpen, setNewSeasonOpen] = useState(false);

  function handleToggleLink() {
    startTransition(() => {
      setPositionRankLinked({
        seasonId,
        seasonYear: currentYear,
        linked: !positionRankLinked,
      });
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-[30px] items-center gap-1.5 rounded-[9px] border border-input bg-transparent pr-2 pl-2.5"
            aria-label="Season"
          >
            <span className="font-mono text-xs">{currentYear}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Season</DropdownMenuLabel>
          {seasons.map((season) => (
            <DropdownMenuItem
              key={season.id}
              onSelect={() => router.push(`/${season.year}/overall`)}
            >
              <span className="flex-1">{season.year}</span>
              {season.year === currentYear && <Check className="size-3.5" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setNewSeasonOpen(true)}>
            New Season
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleToggleLink}
            title={
              positionRankLinked
                ? "Position ranks follow the overall order. Select to rank each position independently instead."
                : "Position ranks are independent of the overall order. Select to derive them from overall instead."
            }
          >
            {positionRankLinked
              ? "Position ranks: linked"
              : "Position ranks: independent"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewSeasonDialog
        seasons={seasons}
        open={newSeasonOpen}
        onOpenChange={setNewSeasonOpen}
      />
    </>
  );
}
