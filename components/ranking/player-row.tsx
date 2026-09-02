"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TierDots } from "@/components/ranking/tier-dots";
import { NotesEditor } from "@/components/ranking/notes-editor";
import { TierBreakToggle } from "@/components/ranking/tier-break-toggle";
import type { PlayerRecord, PlayerTier } from "@/app/actions/players";

export const TIER_BAR_COLOR: Record<PlayerTier, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
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
        "group flex flex-col gap-2 border-b border-b-hairline px-[18px] py-3 hover:bg-surface-wash sm:flex-row sm:items-center sm:gap-3",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-3 sm:contents">
        {showDragHandle && (
          <button
            type="button"
            disabled={dragDisabled}
            className="flex w-3.5 shrink-0 cursor-grab touch-none items-center justify-center text-[oklch(0.4_0_0)] hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
        )}
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
        {showPosition && (
          <span className="w-[74px] shrink-0 font-mono text-xs text-muted-foreground">
            {player.position}
            {player.positionRank} · {player.team}
          </span>
        )}
        {!showPosition && (
          <span className="w-[74px] shrink-0 font-mono text-xs text-muted-foreground">
            {player.team}
          </span>
        )}
        <TierDots tier={player.tier} onChange={(tier) => onTierChange(player, tier)} />
        <NotesEditor
          notes={player.notes}
          onSave={(notes) => onNotesChange(player, notes)}
        />
        {showTierBreakToggle && (
          <TierBreakToggle
            active={tierBreakActive}
            onToggle={() => onToggleTierBreak(player)}
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size={confirming ? "sm" : "icon-sm"}
          onClick={handleDeleteClick}
          className={cn(
            "ml-auto sm:ml-0",
            confirming
              ? "text-destructive"
              : "text-[oklch(0.4_0_0)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          {confirming ? "Confirm?" : <X className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
