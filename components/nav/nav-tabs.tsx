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
    "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
    active
      ? "bg-foreground text-background"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

export function NavTabs({ year }: { year: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
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
        Draft
      </Link>
    </nav>
  );
}
