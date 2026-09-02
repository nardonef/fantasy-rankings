export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-[34px] w-28 animate-pulse rounded-[10px] bg-muted" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-b-hairline px-[18px] py-3 last:border-b-0"
          >
            <div className="h-3 w-[22px] animate-pulse rounded bg-muted" />
            <div className="size-6 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
