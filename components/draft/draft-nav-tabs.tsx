"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { segment: "overall", label: "Overall" },
  { segment: "qb", label: "QB" },
  { segment: "rb", label: "RB" },
  { segment: "wr", label: "WR" },
  { segment: "te", label: "TE" },
] as const;

export function DraftNavTabs({ year }: { year: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-[10px] border border-hairline p-[3px]">
      {TABS.map((tab) => {
        const href = `/${year}/draft/${tab.segment}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "shrink-0 rounded-[7px] px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-raised font-semibold text-chalk shadow-[inset_0_0_0_1px_var(--hairline-2)]"
                : "font-medium text-chalk-faint hover:text-chalk",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
