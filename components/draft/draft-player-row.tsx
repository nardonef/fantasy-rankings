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
        "flex flex-col gap-2 rounded-md border bg-card px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3",
        player.tier && FLAG_HIGHLIGHT[player.tier],
      )}
    >
      <div className="flex items-center gap-3 sm:contents">
        <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">
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
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight">
          {player.name}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
        {showPosition && (
          <Badge variant="secondary">
            {entry.position}
            {entry.positionRank}
          </Badge>
        )}
        <Badge variant="outline">{player.team}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDrafted(entry)}
          className="ml-auto text-muted-foreground hover:text-foreground sm:ml-0"
        >
          <Check className="size-4" />
          <span className="sr-only">Mark drafted</span>
        </Button>
      </div>
    </div>
  );
}
