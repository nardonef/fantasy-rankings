"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewSeasonDialog } from "@/components/season/new-season-dialog";

type Season = { id: number; year: number };

export function SeasonSelector({
  seasons,
  currentYear,
}: {
  seasons: Season[];
  currentYear: number;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(currentYear)}
        onValueChange={(value) => router.push(`/${value}/overall`)}
      >
        <SelectTrigger aria-label="Season" className="h-[34px] border-hairline-2 font-mono text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season.id} value={String(season.year)}>
              {season.year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <NewSeasonDialog seasons={seasons} compact />
    </div>
  );
}
