import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const TIER_STYLES = {
  green: { dot: "bg-emerald-500", borderL: "border-l-emerald-500" },
  yellow: { dot: "bg-amber-400", borderL: "border-l-amber-400" },
  red: { dot: "bg-red-500", borderL: "border-l-red-500" },
} as const;

const BOARD_PREVIEW_ROWS: {
  name: string;
  position: string;
  team: string;
  tier: keyof typeof TIER_STYLES | null;
}[] = [
  { name: "Ja'Marr Chase", position: "WR1", team: "CIN", tier: "green" },
  { name: "Bijan Robinson", position: "RB1", team: "ATL", tier: "green" },
  { name: "Justin Jefferson", position: "WR2", team: "MIN", tier: "green" },
  { name: "Saquon Barkley", position: "RB2", team: "PHI", tier: "yellow" },
  { name: "CeeDee Lamb", position: "WR3", team: "DAL", tier: "yellow" },
  { name: "Malik Nabers", position: "WR4", team: "NYG", tier: null },
  { name: "Jahmyr Gibbs", position: "RB3", team: "DET", tier: null },
];

const CONSENSUS_ROWS: { rank: number; name: string; delta: string; direction: "up" | "down" | null }[] = [
  { rank: 1, name: "Ja'Marr Chase", delta: "you 1", direction: null },
  { rank: 2, name: "Bijan Robinson", delta: "you 2", direction: null },
  { rank: 3, name: "Saquon Barkley", delta: "you 4 ▲", direction: "up" },
  { rank: 4, name: "Justin Jefferson", delta: "you 3 ▼", direction: "down" },
];

function LandingNav() {
  return (
    <nav className="flex items-center justify-between border-b border-hairline px-5 py-5 min-[900px]:px-12">
      <div className="flex items-center gap-2.5">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          Fantasy Rankings
        </span>
      </div>
      <div className="flex items-center gap-5 min-[900px]:gap-7">
        <a href="#features" className="hidden text-sm text-muted-foreground hover:text-foreground min-[900px]:inline">
          How it works
        </a>
        <a href="#consensus" className="hidden text-sm text-muted-foreground hover:text-foreground min-[900px]:inline">
          Consensus
        </a>
        <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
          Log in
        </Link>
        <Link
          href="/sign-up"
          className="flex h-[34px] items-center rounded-[10px] bg-foreground px-3.5 text-sm font-medium text-background"
        >
          Start your board
        </Link>
      </div>
    </nav>
  );
}

function BoardPreviewCard() {
  return (
    <div className="rounded-xl border border-border bg-elevated">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <span className="font-mono text-[11px] tracking-[0.08em] text-muted-2 uppercase">
          2025 · Overall
        </span>
        <div className="flex items-center gap-1.5">
          {Object.values(TIER_STYLES).map(({ dot }) => (
            <span key={dot} className={cn("size-[9px] rounded-full", dot)} />
          ))}
        </div>
      </div>
      {BOARD_PREVIEW_ROWS.map((row, index) => (
        <div
          key={row.name}
          className={cn(
            "flex items-center gap-3 border-b border-b-hairline border-l-[3px] px-4 py-[11px] last:border-b-0",
            row.tier ? TIER_STYLES[row.tier].borderL : "border-l-transparent",
          )}
        >
          <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-2">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">
            {row.name}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {row.position} · {row.team}
          </span>
        </div>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <div className="grid grid-cols-1 items-center gap-10 px-5 pt-16 pb-14 min-[900px]:grid-cols-[1.05fr_1fr] min-[900px]:gap-14 min-[900px]:px-12 min-[900px]:pt-[88px] min-[900px]:pb-[72px]">
      <div className="flex flex-col gap-5">
        <span className="font-mono text-xs tracking-[0.1em] text-emerald-500 uppercase">
          Draft prep · live drafts
        </span>
        <h1 className="text-pretty text-[40px] leading-[1.03] font-semibold tracking-[-0.03em] min-[900px]:text-[60px]">
          Your board, ready before the clock starts.
        </h1>
        <p className="max-w-[44ch] text-lg leading-[1.55] text-muted-foreground">
          Build your own player rankings, tier them by conviction, drag to
          re-order. On draft night, one glance tells you who to take.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/sign-up"
            className="flex h-11 items-center rounded-xl bg-foreground px-5 text-[15px] font-medium text-background"
          >
            Create your rankings
          </Link>
          <Link
            href="/sign-in"
            className="flex h-11 items-center rounded-xl border border-input px-5 text-[15px] font-medium"
          >
            Log in
          </Link>
        </div>
        <span className="font-mono text-xs text-muted-3">
          Free. One season takes about ten minutes to set up.
        </span>
      </div>
      <BoardPreviewCard />
    </div>
  );
}

function FeatureGrid() {
  const features = [
    {
      index: "01",
      title: "Tier by conviction",
      body: "Green, yellow, red. Mark who you'd take happily, who you'd settle for, and who you're avoiding — then insert tier breaks anywhere.",
    },
    {
      index: "02",
      title: "Drag to re-order",
      body: "Move a player and position ranks follow automatically, or keep each position list independent. Every change is undoable.",
    },
    {
      index: "03",
      title: "Draft mode",
      body: "Snapshot your board when the draft starts. Tap a player as they go off the board and the list stays down to who's left.",
    },
  ];

  return (
    <div
      id="features"
      className="grid grid-cols-1 gap-px border-y border-hairline bg-hairline min-[900px]:grid-cols-3"
    >
      {features.map((feature) => (
        <div key={feature.index} className="flex flex-col gap-2.5 bg-background px-8 pt-10 pb-11 min-[900px]:px-10">
          <span className="font-mono text-[11px] tracking-[0.1em] text-muted-3 uppercase">
            {feature.index}
          </span>
          <h3 className="text-[19px] font-semibold tracking-[-0.01em]">{feature.title}</h3>
          <p className="text-[15px] leading-[1.55] text-muted-foreground">{feature.body}</p>
        </div>
      ))}
    </div>
  );
}

function ConsensusTeaser() {
  return (
    <div
      id="consensus"
      className="grid grid-cols-1 items-center gap-8 px-5 py-12 min-[900px]:grid-cols-[1fr_auto] min-[900px]:gap-12 min-[900px]:px-12 min-[900px]:py-16"
    >
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[11px] tracking-[0.1em] text-emerald-500 uppercase">
          Coming next
        </span>
        <h2 className="max-w-[26ch] text-[34px] leading-[1.15] font-semibold tracking-[-0.02em]">
          Every board in the world, consolidated into one.
        </h2>
        <p className="max-w-[52ch] text-base leading-[1.6] text-muted-foreground">
          As people build their own rankings here, we&apos;ll roll them up
          into a consensus board — so you can see where your take is
          contrarian and where the crowd agrees with you.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-elevated p-5 min-[900px]:w-[340px]">
        {CONSENSUS_ROWS.map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="w-4 shrink-0 font-mono text-xs text-muted-2">{row.rank}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.name}</span>
            <span
              className={
                "shrink-0 font-mono text-[11px] " +
                (row.direction === "up"
                  ? "text-emerald-500"
                  : row.direction === "down"
                    ? "text-amber-400"
                    : "text-muted-3")
              }
            >
              {row.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-hairline px-5 py-7 font-mono text-xs text-muted-3 min-[900px]:px-12">
      <span>Fantasy Rankings — 2025</span>
      <div className="flex items-center gap-6">
        <Link href="/sign-in" className="hover:text-foreground">
          Log in
        </Link>
        <Link href="/sign-up" className="hover:text-foreground">
          Sign up
        </Link>
        <ThemeToggle />
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav />
      <Hero />
      <FeatureGrid />
      <ConsensusTeaser />
      <LandingFooter />
    </div>
  );
}
