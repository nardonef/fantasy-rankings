export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-md border bg-card" />
        ))}
      </div>
    </div>
  );
}
