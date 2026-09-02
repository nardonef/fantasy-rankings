"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createPlayer, type PlayerRecord } from "@/app/actions/players";
import {
  getPlayerCatalog,
  refreshPlayerCatalog,
  type CatalogPlayer,
} from "@/app/actions/catalog";
import { nflTeamEnum, playerPositionEnum } from "@/lib/db/schema";
import { matchesSearch } from "@/lib/search";
import { normalizeTeam } from "@/lib/teams";
import type { Position } from "@/lib/positions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddPlayerDialog({
  seasonId,
  seasonYear,
  fixedPosition,
  onCreated,
}: {
  seasonId: number;
  seasonYear: number;
  fixedPosition?: Position;
  onCreated: (player: PlayerRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [catalog, setCatalog] = useState<CatalogPlayer[]>([]);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState<string>(fixedPosition ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (open) {
      getPlayerCatalog().then(setCatalog);
    }
  }, [open]);

  const suggestions =
    name.trim().length >= 2
      ? catalog
          .filter((p) => matchesSearch(name, p.name, p.team ?? ""))
          .slice(0, 50)
      : [];

  function selectSuggestion(player: CatalogPlayer) {
    setName(player.name);
    const team = normalizeTeam(player.team);
    if (team) setTeam(team);
    setPosition(player.position);
    setPhotoUrl(player.photoUrl);
    setShowSuggestions(false);
  }

  function handleRefresh() {
    startRefresh(async () => {
      const result = await refreshPlayerCatalog();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const fresh = await getPlayerCatalog();
      setCatalog(fresh);
      toast.success(`Loaded ${result.count} players.`);
    });
  }

  function resetForm() {
    setName("");
    setTeam("");
    setPosition(fixedPosition ?? "");
    setPhotoUrl(null);
    setShowSuggestions(false);
    formRef.current?.reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await createPlayer(undefined, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.player) {
        onCreated(result.player);
        setOpen(false);
        resetForm();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-[34px] rounded-[10px] px-3.5">Add player</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <input type="hidden" name="seasonId" value={seasonId} />
          <input type="hidden" name="seasonYear" value={seasonYear} />
          <input type="hidden" name="photoUrl" value={photoUrl ?? ""} />
          <DialogHeader>
            <DialogTitle>Add player</DialogTitle>
            <DialogDescription>
              Add a player to this season&apos;s rankings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">Name</Label>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
                >
                  {refreshing ? "Refreshing…" : "Refresh player list"}
                </button>
              </div>
              <div className="relative flex items-center gap-2">
                {photoUrl && (
                  <Image
                    src={photoUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded-full object-cover"
                  />
                )}
                <Input
                  id="name"
                  name="name"
                  required
                  autoFocus
                  autoComplete="off"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setPhotoUrl(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                    {suggestions.map((player) => (
                      <button
                        key={player.sleeperId}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          selectSuggestion(player);
                        }}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        {player.photoUrl && (
                          <Image
                            src={player.photoUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 shrink-0 rounded-full object-cover"
                          />
                        )}
                        <span className="flex-1 truncate">{player.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {player.position} · {player.team ?? "FA"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team">Team</Label>
              <Select name="team" required value={team} onValueChange={setTeam}>
                <SelectTrigger id="team" className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {nflTeamEnum.enumValues.map((teamOption) => (
                    <SelectItem key={teamOption} value={teamOption}>
                      {teamOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="position">Position</Label>
              <Select
                name="position"
                required
                value={position}
                onValueChange={setPosition}
              >
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {playerPositionEnum.enumValues.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
