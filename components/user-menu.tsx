"use client";

import { UserButton } from "@clerk/nextjs";
import { useThemeCycle } from "@/components/theme-toggle";

export function UserMenu() {
  const { active, cycle } = useThemeCycle();
  const Icon = active.icon;

  return (
    <UserButton appearance={{ elements: { userButtonAvatarBox: "size-7" } }}>
      <UserButton.MenuItems>
        <UserButton.Action
          label={`Theme: ${active.label}`}
          labelIcon={<Icon className="size-4" />}
          onClick={cycle}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
