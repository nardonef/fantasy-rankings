"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TierDots } from "@/components/ranking/tier-dots";
import { NotesEditor } from "@/components/ranking/notes-editor";
import { TierBreakToggle } from "@/components/ranking/tier-break-toggle";
import type { PlayerRecord, PlayerTier } from "@/app/actions/players";

export const FLAG_HIGHLIGHT: Record<PlayerTier, string> = {
  green: "bg-rankings/[.06] shadow-[inset_3px_0_0_var(--rankings)] pl-[15px]",
  yellow: "bg-flag-yellow/[.06] shadow-[inset_3px_0_0_var(--flag-yellow)] pl-[15px]",
  red: "bg-regret/[.06] shadow-[inset_3px_0_0_var(--regret)] pl-[15px]",
};

export function PlayerRow({
  player,
  rank,
  showPosition,
  showDragHandle = true,
  dragDisabled = false,
  showTierBreakToggle = false,
  tierBreakActive = false,
  onDelete,
  onTierChange,
  onNotesChange,
  onToggleTierBreak,
}: {
  player: PlayerRecord;
  rank: number;
  showPosition: boolean;
  showDragHandle?: boolean;
  dragDisabled?: boolean;
  showTierBreakToggle?: boolean;
  tierBreakActive?: boolean;
  onDelete: (player: PlayerRecord) => void;
  onTierChange: (player: PlayerRecord, tier: PlayerTier | null) => void;
  onNotesChange: (player: PlayerRecord, notes: string) => void;
  onToggleTierBreak: (player: PlayerRecord) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: player.id, disabled: dragDisabled });
  const [confirming, setConfirming] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleDeleteClick() {
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
    onDelete(player);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 rounded-[9px] border border-hairline bg-field px-3 py-2.5 sm:h-[52px] sm:flex-row sm:items-center sm:gap-3 sm:py-0",
        player.tier && FLAG_HIGHLIGHT[player.tier],
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-3 sm:contents">
        {showDragHandle && (
          <button
            type="button"
            disabled={dragDisabled}
            className="cursor-grab touch-none text-chalk-faintest hover:text-chalk-dim active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
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
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.02em]">{player.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
        <TierDots
          tier={player.tier}
          onChange={(tier) => onTierChange(player, tier)}
        />
        {showPosition && (
          <Badge variant="secondary" className="w-[52px] rounded-[5px] bg-raised font-mono text-[11px]">
            {player.position}
            {player.positionRank}
          </Badge>
        )}
        <Badge variant="outline" className="w-11 rounded-[5px] border-hairline-2 font-mono text-[11px] text-chalk-dim">{player.team}</Badge>
        <NotesEditor
          notes={player.notes}
          onSave={(notes) => onNotesChange(player, notes)}
        />
        {player.notes && (
          <span className="hidden w-[150px] truncate text-[13px] text-chalk-faint sm:block">
            {player.notes}
          </span>
        )}
        {showTierBreakToggle && (
          <TierBreakToggle
            active={tierBreakActive}
            onToggle={() => onToggleTierBreak(player)}
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          className={cn("ml-auto sm:ml-0", confirming ? "text-regret" : "text-chalk-muted")}
        >
          {confirming ? "Confirm?" : <X className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
