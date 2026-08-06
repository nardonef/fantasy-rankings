"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TierDots } from "@/components/ranking/tier-dots";
import { NotesEditor } from "@/components/ranking/notes-editor";
import type { PlayerRecord, PlayerTier } from "@/app/actions/players";

export function PlayerRow({
  player,
  rank,
  showPosition,
  dragDisabled = false,
  onDelete,
  onTierChange,
  onNotesChange,
}: {
  player: PlayerRecord;
  rank: number;
  showPosition: boolean;
  dragDisabled?: boolean;
  onDelete: (player: PlayerRecord) => void;
  onTierChange: (player: PlayerRecord, tier: PlayerTier | null) => void;
  onNotesChange: (player: PlayerRecord, notes: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: player.id, disabled: dragDisabled });
  const [confirming, setConfirming] = useState(false);
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
        "flex items-center gap-3 rounded-md border bg-card px-3 py-2",
        isDragging && "opacity-50",
      )}
    >
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
      <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">
        {rank}
      </span>
      <span className="flex-1 truncate text-sm font-medium">{player.name}</span>
      <TierDots
        tier={player.tier}
        onChange={(tier) => onTierChange(player, tier)}
      />
      {showPosition && (
        <span className="text-xs font-semibold text-muted-foreground">
          {player.position}
        </span>
      )}
      <span className="text-xs text-muted-foreground">{player.team}</span>
      <NotesEditor
        notes={player.notes}
        onSave={(notes) => onNotesChange(player, notes)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDeleteClick}
        className={confirming ? "text-destructive" : "text-muted-foreground"}
      >
        {confirming ? "Confirm?" : <X className="size-4" />}
      </Button>
    </div>
  );
}
