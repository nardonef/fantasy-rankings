"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FLAG_HIGHLIGHT } from "@/components/ranking/player-row";
import type { DraftPlayerRecord } from "@/lib/draft";

export function DraftPlayerRow({
  entry,
  rank,
  showPosition,
  onDrafted,
}: {
  entry: DraftPlayerRecord;
  rank: number;
  showPosition: boolean;
  onDrafted: (entry: DraftPlayerRecord) => void;
}) {
  const { player } = entry;
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[9px] border border-hairline bg-field px-3 py-2.5 sm:h-[52px] sm:flex-row sm:items-center sm:gap-3 sm:py-0",
        player.tier && FLAG_HIGHLIGHT[player.tier],
      )}
    >
      <div className="flex items-center gap-3 sm:contents">
        <span className="w-6 text-right font-mono text-[13px] tabular-nums text-chalk-muted">
          {rank}
        </span>
        {player.photoUrl && !photoFailed ? (
          <Image
            src={player.photoUrl}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-raised text-muted-foreground">
            <User className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.02em]">
          {player.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
        {showPosition && (
          <Badge variant="secondary" className="w-[52px] rounded-[5px] bg-raised font-mono text-[11px]">
            {entry.position}
            {entry.positionRank}
          </Badge>
        )}
        <Badge variant="outline" className="w-11 rounded-[5px] border-hairline-2 font-mono text-[11px] text-chalk-dim">{player.team}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDrafted(entry)}
          className="ml-auto text-chalk-muted hover:text-rankings sm:ml-0"
        >
          <Check className="size-4" />
          <span className="sr-only">Mark drafted</span>
        </Button>
      </div>
    </div>
  );
}
