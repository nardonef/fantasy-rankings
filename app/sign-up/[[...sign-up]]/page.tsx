import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-4">
      <SignUp />
    </main>
  );
}
