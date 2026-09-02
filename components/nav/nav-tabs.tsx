"use client";

import { usePathname } from "next/navigation";
import { SegmentedTabs } from "@/components/nav/segmented-tabs";

const TABS = [
  { segment: "overall", label: "Overall" },
  { segment: "qb", label: "QB" },
  { segment: "rb", label: "RB" },
  { segment: "wr", label: "WR" },
  { segment: "te", label: "TE" },
] as const;

export function NavTabs({ year }: { year: number }) {
  const pathname = usePathname();

  const tabs: { href: string; label: string; active: boolean }[] = TABS.map((tab) => {
    const href = `/${year}/${tab.segment}`;
    return { href, label: tab.label, active: pathname === href };
  });
  tabs.push({
    href: `/${year}/draft/overall`,
    label: "Draft",
    active: pathname.startsWith(`/${year}/draft`),
  });

  return <SegmentedTabs tabs={tabs} />;
}
