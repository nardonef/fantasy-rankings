import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="font-mono text-xs text-muted-2">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2.5">{children}</div>
    </div>
  );
}
