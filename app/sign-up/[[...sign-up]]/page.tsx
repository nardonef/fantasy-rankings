import { SignUp } from "@clerk/nextjs";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthFooter } from "@/components/auth/auth-footer";
import { rankingsAppearance } from "@/lib/clerk-appearance";

export const metadata = { title: "Sign up · fantasy·rankings" };

export default function Page() {
  return (
    <main className="grid min-h-svh bg-page lg:grid-cols-[1.1fr_1fr]">
      <AuthBrandPanel
        kicker={`${new Date().getFullYear()} · NEW BOARD`}
        headline="Start a board. Draft like you meant it."
        body="Rank, tier and flag every player. Bring the board to your draft."
      />
      <section className="relative flex items-end justify-center px-6 pb-16 pt-7 lg:items-center lg:p-10">
        <SignUp appearance={rankingsAppearance} />
        <AuthFooter />
      </section>
    </main>
  );
}
