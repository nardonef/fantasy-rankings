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

function tabClassName(active: boolean) {
  return cn(
    "flex shrink-0 items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
    active
      ? "bg-raised font-semibold text-chalk shadow-[inset_0_0_0_1px_var(--hairline-2)]"
      : "font-medium text-chalk-faint hover:text-chalk",
  );
}

export function NavTabs({ year }: { year: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-[10px] border border-hairline p-[3px]">
      {TABS.map((tab) => {
        const href = `/${year}/${tab.segment}`;
        return (
          <Link key={tab.segment} href={href} className={tabClassName(pathname === href)}>
            {tab.label}
          </Link>
        );
      })}
      <Link
        href={`/${year}/draft/overall`}
        className={tabClassName(pathname.startsWith(`/${year}/draft`))}
      >
        <span aria-hidden className="size-[5px] rounded-full bg-rankings" />
        Draft
      </Link>
    </nav>
  );
}
