"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  deletePlayer,
  reorderPlayers,
  updateTier,
  type PlayerRecord,
  type PlayerTier,
} from "@/app/actions/players";
import type { Position } from "@/lib/positions";
import { PlayerRow } from "@/components/ranking/player-row";
import { AddPlayerDialog } from "@/components/ranking/add-player-dialog";

export function RankingList({
  context,
  seasonId,
  seasonYear,
  position,
  initialPlayers,
}: {
  context: "position" | "overall";
  seasonId: number;
  seasonYear: number;
  position?: Position;
  initialPlayers: PlayerRecord[];
}) {
  const [items, setItems] = useState(initialPlayers);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(() => {
      reorderPlayers({
        seasonYear,
        context,
        position,
        orderedIds: next.map((p) => p.id),
      }).then((result) => {
        if (result.error) {
          setItems(previous);
          toast.error("Couldn't save the new order.");
        }
      });
    });
  }

  function handleDelete(player: PlayerRecord) {
    const previous = items;
    setItems(items.filter((p) => p.id !== player.id));

    startTransition(() => {
      deletePlayer({
        playerId: player.id,
        seasonId,
        seasonYear,
        position: player.position,
      }).then((result) => {
        if (result.error) {
          setItems(previous);
          toast.error("Couldn't delete player.");
        }
      });
    });
  }

  function handleCreated(player: PlayerRecord) {
    setItems((prev) => [...prev, player]);
  }

  function handleTierChange(player: PlayerRecord, tier: PlayerTier | null) {
    const previous = items;
    setItems(items.map((p) => (p.id === player.id ? { ...p, tier } : p)));

    startTransition(() => {
      updateTier({
        playerId: player.id,
        seasonYear,
        position: player.position,
        tier,
      }).then((result) => {
        if (result.error) {
          setItems(previous);
          toast.error("Couldn't update tier.");
        }
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} player{items.length === 1 ? "" : "s"}
        </p>
        <AddPlayerDialog
          seasonId={seasonId}
          seasonYear={seasonYear}
          fixedPosition={context === "position" ? position : undefined}
          onCreated={handleCreated}
        />
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          No players yet. Add your first one.
        </p>
      ) : (
        <DndContext
          id={`ranking-${seasonYear}-${context}-${position ?? "all"}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {items.map((player, index) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  showPosition={context === "overall"}
                  onDelete={handleDelete}
                  onTierChange={handleTierChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
