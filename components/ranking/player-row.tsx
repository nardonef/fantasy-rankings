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
  green: "bg-emerald-500/10 border-l-4 border-l-emerald-500",
  yellow: "bg-amber-400/10 border-l-4 border-l-amber-400",
  red: "bg-red-500/10 border-l-4 border-l-red-500",
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
        "flex flex-col gap-2 rounded-md border bg-card px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3",
        player.tier && FLAG_HIGHLIGHT[player.tier],
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-3 sm:contents">
        {showDragHandle && (
          <button
            type="button"
            disabled={dragDisabled}
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
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
        <span className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight">{player.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:contents">
        <TierDots
          tier={player.tier}
          onChange={(tier) => onTierChange(player, tier)}
        />
        {showPosition && (
          <Badge variant="secondary">
            {player.position}
            {player.positionRank}
          </Badge>
        )}
        <Badge variant="outline">{player.team}</Badge>
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
          size="sm"
          onClick={handleDeleteClick}
          className={cn("ml-auto sm:ml-0", confirming ? "text-destructive" : "text-muted-foreground")}
        >
          {confirming ? "Confirm?" : <X className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
