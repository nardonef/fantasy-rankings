"use client";

import { useRef, useState, useTransition } from "react";
import { createPlayer, type PlayerRecord } from "@/app/actions/players";
import { nflTeamEnum, playerPositionEnum } from "@/lib/db/schema";
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
  const formRef = useRef<HTMLFormElement>(null);

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
        formRef.current?.reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Player</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <input type="hidden" name="seasonId" value={seasonId} />
          <input type="hidden" name="seasonYear" value={seasonYear} />
          <DialogHeader>
            <DialogTitle>Add player</DialogTitle>
            <DialogDescription>
              Add a player to this season&apos;s rankings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="team">Team</Label>
              <Select name="team" required>
                <SelectTrigger id="team" className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {nflTeamEnum.enumValues.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {fixedPosition ? (
              <input type="hidden" name="position" value={fixedPosition} />
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="position">Position</Label>
                <Select name="position" required>
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
            )}
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
