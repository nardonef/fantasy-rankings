"use client";

import { Fragment, useState, useTransition } from "react";
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
  setTierBreak,
  updateNotes,
  updateTier,
  type PlayerRecord,
  type PlayerTier,
} from "@/app/actions/players";
import type { Position } from "@/lib/positions";
import { matchesSearch } from "@/lib/search";
import { computeTierGroups } from "@/lib/ranking";
import { PlayerRow } from "@/components/ranking/player-row";
import { AddPlayerDialog } from "@/components/ranking/add-player-dialog";
import { SearchFilterBar } from "@/components/ranking/search-filter-bar";
import { TierDivider } from "@/components/ranking/tier-divider";

export function RankingList({
  context,
  seasonId,
  seasonYear,
  position,
  positionRankLinked,
  initialPlayers,
}: {
  context: "position" | "overall";
  seasonId: number;
  seasonYear: number;
  position?: Position;
  positionRankLinked: boolean;
  initialPlayers: PlayerRecord[];
}) {
  const [items, setItems] = useState(initialPlayers);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const isFiltering = query.trim().length > 0;
  const draggable = context === "overall" || !positionRankLinked;
  const visible = items
    .map((player, index) => ({ player, rank: index + 1 }))
    .filter(({ player }) => matchesSearch(query, player.name, player.team));
  const tierBreakField =
    context === "position" ? "positionTierBreak" : "overallTierBreak";
  const tierNumbers = isFiltering
    ? visible.map(() => 1)
    : computeTierGroups(visible.map(({ player }) => player[tierBreakField]));
  const showTierDividers = !isFiltering && (tierNumbers.at(-1) ?? 1) > 1;
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
        positionRankLinked,
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
    const belongsInThisView = context === "overall" || player.position === position;
    if (belongsInThisView) {
      setItems((prev) => [...prev, player]);
    } else {
      toast.success(`Added ${player.name} (${player.position}) — view the ${player.position} tab to see them.`);
    }
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

  function handleNotesChange(player: PlayerRecord, notes: string) {
    const previous = items;
    const nextNotes = notes.length > 0 ? notes : null;
    setItems(items.map((p) => (p.id === player.id ? { ...p, notes: nextNotes } : p)));

    startTransition(() => {
      updateNotes({
        playerId: player.id,
        seasonYear,
        position: player.position,
        notes,
      }).then((result) => {
        if (result.error) {
          setItems(previous);
          toast.error("Couldn't save notes.");
        }
      });
    });
  }

  function handleToggleTierBreak(player: PlayerRecord) {
    const previous = items;
    const nextValue = !player[tierBreakField];
    setItems(
      items.map((p) =>
        p.id === player.id ? { ...p, [tierBreakField]: nextValue } : p,
      ),
    );

    startTransition(() => {
      setTierBreak({
        playerId: player.id,
        seasonYear,
        context,
        position,
        breakAfter: nextValue,
      }).then((result) => {
        if (result.error) {
          setItems(previous);
          toast.error("Couldn't update tier break.");
        }
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} player{items.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-1 items-center justify-end gap-3">
          <SearchFilterBar value={query} onChange={setQuery} />
          <AddPlayerDialog
            seasonId={seasonId}
            seasonYear={seasonYear}
            fixedPosition={context === "position" ? position : undefined}
            onCreated={handleCreated}
          />
        </div>
      </div>
      {isFiltering && (
        <p className="text-xs text-muted-foreground">
          Clear search to reorder.
        </p>
      )}
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          No players yet. Add your first one.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          No players match &quot;{query.trim()}&quot;.
        </p>
      ) : (
        <DndContext
          id={`ranking-${seasonYear}-${context}-${position ?? "all"}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visible.map(({ player }) => player.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {visible.map(({ player, rank }, index) => (
                <Fragment key={player.id}>
                  {showTierDividers &&
                    (index === 0 || tierNumbers[index] !== tierNumbers[index - 1]) && (
                      <TierDivider tier={tierNumbers[index]} />
                    )}
                  <PlayerRow
                    player={player}
                    rank={rank}
                    showPosition={context === "overall"}
                    showDragHandle={draggable}
                    dragDisabled={isFiltering || !draggable}
                    showTierBreakToggle={!isFiltering && index < visible.length - 1}
                    tierBreakActive={player[tierBreakField]}
                    onDelete={handleDelete}
                    onTierChange={handleTierChange}
                    onNotesChange={handleNotesChange}
                    onToggleTierBreak={handleToggleTierBreak}
                  />
                </Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
