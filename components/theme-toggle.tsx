"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
  { value: "system", icon: Monitor, label: "System theme" },
] as const;

export function useThemeCycle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    const currentIndex = MODES.findIndex((m) => m.value === theme);
    const next = MODES[(currentIndex + 1) % MODES.length];
    setTheme(next.value);
  }

  const active = MODES.find((m) => m.value === theme) ?? MODES[2];
  return { active, cycle };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { active, cycle } = useThemeCycle();
  const Icon = active.icon;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="Toggle theme"
      className={cn(
        "flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
