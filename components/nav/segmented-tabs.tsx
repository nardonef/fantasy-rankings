import Link from "next/link";
import { cn } from "@/lib/utils";

export function SegmentedTabs({
  tabs,
}: {
  tabs: { href: string; label: string; active: boolean }[];
}) {
  return (
    <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-[10px] bg-[oklch(0.955_0_0)] p-[3px] dark:bg-white/5">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "shrink-0 rounded-[7px] px-3 py-[5px] text-[13px] font-medium whitespace-nowrap transition-colors",
            tab.active
              ? "bg-background text-foreground dark:bg-foreground dark:text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
