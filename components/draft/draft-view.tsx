"use client";

import type { ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { markDrafted } from "@/app/actions/draft";
import { matchesSearch } from "@/lib/search";
import type { Position } from "@/lib/positions";
import type { DraftPlayerRecord } from "@/lib/draft";
import { DraftPlayerRow } from "@/components/draft/draft-player-row";
import { SearchFilterBar } from "@/components/ranking/search-filter-bar";
import { PageHeader } from "@/components/page-header";

export function DraftView({
  seasonYear,
  context,
  position,
  initialPlayers,
  controls,
}: {
  seasonYear: number;
  context: "position" | "overall";
  position?: Position;
  initialPlayers: DraftPlayerRecord[];
  controls: ReactNode;
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
  const title = context === "overall" ? "Draft — Overall" : `Draft — ${position}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={`${remaining.length} of ${items.length} left on the board`}
      >
        <SearchFilterBar value={query} onChange={setQuery} />
        {controls}
      </PageHeader>
      {items.length === 0 ? (
        <p className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          No players in this draft yet.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
          {remaining.length === 0
            ? "Everyone's been drafted."
            : `No players match "${query.trim()}".`}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border [&>*:last-child]:border-b-0">
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
