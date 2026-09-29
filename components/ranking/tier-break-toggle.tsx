import { SeparatorHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TierBreakToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Remove tier break after this player" : "Insert tier break after this player"}
      className={cn(
        "text-muted-foreground",
        active && "text-rankings hover:text-rankings",
      )}
    >
      <SeparatorHorizontal className="size-4" />
    </Button>
  );
}
