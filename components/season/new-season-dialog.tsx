"use client";

import { useActionState } from "react";
import { createSeason } from "@/app/actions/seasons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

type Season = { id: number; year: number };

export function NewSeasonDialog({
  seasons,
  open,
  onOpenChange,
}: {
  seasons: Season[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    createSeason,
    undefined,
  );
  const defaultYear = new Date().getFullYear();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create a new season</DialogTitle>
            <DialogDescription>
              Start a fresh ranking set for a given year.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={defaultYear}
                required
              />
            </div>
            {seasons.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="copyFromSeasonId">
                  Copy players from (optional)
                </Label>
                <Select name="copyFromSeasonId">
                  <SelectTrigger id="copyFromSeasonId">
                    <SelectValue placeholder="Start empty" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={String(season.id)}>
                        {season.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {state?.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create season"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
