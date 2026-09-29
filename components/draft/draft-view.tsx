"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { markDrafted } from "@/app/actions/draft";
import { matchesSearch } from "@/lib/search";
import type { DraftPlayerRecord } from "@/lib/draft";
import { DraftPlayerRow } from "@/components/draft/draft-player-row";
import { SearchFilterBar } from "@/components/ranking/search-filter-bar";

export function DraftView({
  seasonYear,
  context,
  initialPlayers,
}: {
  seasonYear: number;
  context: "position" | "overall";
  initialPlayers: DraftPlayerRecord[];
}) {
  const [items, setItems] = useState(initialPlayers);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const undoToastId = useRef<string | number | null>(null);

  function clearPendingUndo() {
    if (undoToastId.current !== null) {
      toast.dismiss(undoToastId.current);
      undoToastId.current = null;
    }
  }

  function setDrafted(draftedPlayerId: number, draftedAt: Date | null) {
    setItems((prev) =>
      prev.map((p) => (p.draftedPlayerId === draftedPlayerId ? { ...p, draftedAt } : p)),
    );
  }

  function handleDrafted(entry: DraftPlayerRecord) {
    clearPendingUndo();
    setDrafted(entry.draftedPlayerId, new Date());

    startTransition(() => {
      markDrafted({
        draftedPlayerId: entry.draftedPlayerId,
        seasonYear,
        drafted: true,
      }).then((result) => {
        if (result.error) {
          setDrafted(entry.draftedPlayerId, null);
          toast.error("Couldn't mark player as drafted.");
          return;
        }
        undoToastId.current = toast(`${entry.player.name} marked drafted.`, {
          action: {
            label: "Undo",
            onClick: () => {
              undoToastId.current = null;
              setDrafted(entry.draftedPlayerId, null);
              startTransition(() => {
                markDrafted({
                  draftedPlayerId: entry.draftedPlayerId,
                  seasonYear,
                  drafted: false,
                }).then((r) => {
                  if (r.error) toast.error("Couldn't undo — refresh to resync.");
                });
              });
            },
          },
          duration: 6000,
          onAutoClose: () => {
            undoToastId.current = null;
          },
          onDismiss: () => {
            undoToastId.current = null;
          },
        });
      });
    });
  }

  const remaining = items.filter((p) => !p.draftedAt);
  const visible = remaining.filter(({ player }) => matchesSearch(query, player.name, player.team));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {remaining.length} of {items.length} left
        </p>
        <SearchFilterBar value={query} onChange={setQuery} />
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline-2 py-12 text-center text-sm text-chalk-faint">
          No players in this draft yet.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline-2 py-12 text-center text-sm text-chalk-faint">
          {remaining.length === 0
            ? "Everyone's been drafted."
            : `No players match "${query.trim()}".`}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((entry) => (
            <DraftPlayerRow
              key={entry.draftedPlayerId}
              entry={entry}
              rank={context === "overall" ? entry.overallRank : entry.positionRank}
              showPosition={context === "overall"}
              onDrafted={handleDrafted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
