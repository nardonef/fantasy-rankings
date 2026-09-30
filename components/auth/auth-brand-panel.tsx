import { Wordmark } from "@/components/wordmark";

const ROW =
  "flex h-12 items-center gap-3 rounded-[9px] border border-hairline bg-[#0e0e11] px-4";

function Badge({ children }: { children: string }) {
  return (
    <span className="pill ml-auto border-hairline-2 text-chalk-faint">
      {children}
    </span>
  );
}

function BoardPreview() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-20 left-12 top-[170px] flex -rotate-4 flex-col gap-2 opacity-90 max-lg:hidden"
    >
      <div className="flex items-center gap-3">
        <span className="kicker text-rankings">TIER 1</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <div className="flex h-12 items-center gap-3 rounded-[9px] border border-hairline bg-rankings/[.06] px-4 shadow-[inset_3px_0_0_var(--rankings)]">
        <span className="font-mono text-sm text-chalk-dim">1</span>
        <span className="size-7 rounded-full bg-raised" />
        <span className="text-[15px] font-medium text-chalk">
          Ja&apos;Marr Chase
        </span>
        <Badge>WR1</Badge>
      </div>
      <div className={`${ROW} blur-[1.5px]`}>
        <span className="font-mono text-sm text-chalk-dim">2</span>
        <span className="size-7 rounded-full bg-raised" />
        <span className="text-[15px] text-chalk-dim">██████ ████████</span>
        <Badge>RB1</Badge>
      </div>
      <div className={`${ROW} opacity-70 blur-[3px]`}>
        <span className="font-mono text-sm text-chalk-dim">3</span>
        <span className="size-7 rounded-full bg-raised" />
        <span className="text-[15px] text-chalk-dim">██████ ████████</span>
        <Badge>RB2</Badge>
      </div>
      <div className="flex items-center gap-3 opacity-50 blur-[3px]">
        <span className="kicker text-chalk-dim">TIER 2</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <div className={`${ROW} opacity-40 blur-[5px]`} />
      <div className={`${ROW} opacity-25 blur-[6px]`} />
      <div className="absolute inset-x-0 top-[120px] h-[420px] bg-gradient-to-b from-transparent from-40% to-field to-92%" />
    </div>
  );
}

export function AuthBrandPanel({
  kicker,
  headline,
  body,
}: {
  kicker: string;
  headline: string;
  body: string;
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden px-6 pt-14 lg:border-r lg:border-hairline lg:bg-field lg:px-12 lg:py-10">
      <Wordmark tool="rankings" size={22} />
      <BoardPreview />
      <div className="relative mt-7 flex flex-col gap-[18px] lg:mt-0">
        <p className="kicker text-rankings">{kicker}</p>
        <h1 className="text-[42px] font-semibold leading-[0.9] tracking-[-0.055em] lg:text-[64px]">
          {headline}
          <span
            aria-hidden
            className="ml-[0.06em] inline-block size-[0.17em] rounded-full bg-rankings"
          />
        </h1>
        <p className="max-w-[420px] text-[17px] leading-normal text-chalk-dim max-lg:hidden">
          {body}
        </p>
      </div>
    </div>
  );
}
