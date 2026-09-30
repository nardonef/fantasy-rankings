import { SignIn } from "@clerk/nextjs";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthFooter } from "@/components/auth/auth-footer";
import { rankingsAppearance } from "@/lib/clerk-appearance";

export const metadata = { title: "Sign in · fantasy·rankings" };

export default function Page() {
  return (
    <main className="grid min-h-svh bg-page lg:grid-cols-[1.1fr_1fr]">
      <AuthBrandPanel
        kicker={`${new Date().getFullYear()} · DRAFT PREP`}
        headline="Your board is where you left it"
        body="Tiers, flags, notes. Nobody else sees it, including the guy who drafts a kicker in round 9."
      />
      <section className="relative flex items-end justify-center px-6 pb-16 pt-7 lg:items-center lg:p-10">
        <SignIn appearance={rankingsAppearance} />
        <AuthFooter />
      </section>
    </main>
  );
}
