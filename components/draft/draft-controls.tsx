"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startDraft } from "@/app/actions/draft";
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

export function DraftControls({
  seasonId,
  seasonYear,
  hasSession,
}: {
  seasonId: number;
  seasonYear: number;
  hasSession: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleStart() {
    startTransition(() => {
      startDraft({ seasonId, seasonYear }).then((result) => {
        if (result.error) {
          toast.error("Couldn't start the draft.");
          return;
        }
        setOpen(false);
        router.refresh();
      });
    });
  }

  if (!hasSession) {
    return (
      <Button
        type="button"
        onClick={handleStart}
        disabled={pending}
        className="h-[34px] rounded-[10px] px-3.5"
      >
        {pending ? "Starting…" : "Start Draft"}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-[34px] rounded-[10px] px-3.5">
          Reset Draft
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset the draft?</DialogTitle>
          <DialogDescription>
            This re-snapshots your current rankings and clears every player
            marked as drafted. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleStart} disabled={pending}>
            {pending ? "Resetting…" : "Reset Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
