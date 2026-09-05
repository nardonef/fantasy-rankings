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

export function DraftNavTabs({ year }: { year: number }) {
  const pathname = usePathname();

  const tabs = TABS.map((tab) => {
    const href = `/${year}/draft/${tab.segment}`;
    return { href, label: tab.label, active: pathname === href };
  });

  return <SegmentedTabs tabs={tabs} />;
}
