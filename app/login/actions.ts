"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/session";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Password is required." };
  }

  if (!verifyPassword(password)) {
    return { error: "Incorrect password." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
