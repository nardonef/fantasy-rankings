"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_BAR_COLOR } from "@/components/ranking/player-row";
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
    <div className="flex flex-col gap-2 border-b border-b-hairline px-[18px] py-2.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-3 sm:contents">
        <span className="w-[22px] shrink-0 text-right font-mono text-[13px] text-muted-2">
          {rank}
        </span>
        {player.photoUrl && !photoFailed ? (
          <Image
            src={player.photoUrl}
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="size-3.5" />
          </span>
        )}
        <span
          className={cn(
            "h-5 w-[3px] shrink-0 rounded-[2px]",
            player.tier ? TIER_BAR_COLOR[player.tier] : "bg-transparent",
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.01em]">
          {player.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
        {showPosition ? (
          <span className="w-[74px] shrink-0 font-mono text-xs text-muted-foreground">
            {entry.position}
            {entry.positionRank} · {player.team}
          </span>
        ) : (
          <span className="w-[74px] shrink-0 font-mono text-xs text-muted-foreground">
            {player.team}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDrafted(entry)}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs font-medium text-[oklch(0.35_0_0)] hover:bg-muted sm:ml-0"
        >
          <Check className="size-[13px]" />
          Taken
        </button>
      </div>
    </div>
  );
}
