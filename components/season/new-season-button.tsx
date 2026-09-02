"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewSeasonDialog } from "@/components/season/new-season-dialog";

type Season = { id: number; year: number };

export function NewSeasonButton({ seasons }: { seasons: Season[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        New Season
      </Button>
      <NewSeasonDialog seasons={seasons} open={open} onOpenChange={setOpen} />
    </>
  );
}
