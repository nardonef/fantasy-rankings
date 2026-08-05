import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Fantasy Rankings
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the password to continue.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
