import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return <span className={cn("size-2.5 shrink-0 rounded-[2px] bg-emerald-500", className)} />;
}
