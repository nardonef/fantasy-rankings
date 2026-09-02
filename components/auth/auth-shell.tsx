import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-[400px] flex-col gap-7">
        <div className="flex items-center justify-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold tracking-[-0.01em]">
            Fantasy Rankings
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
