import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { upsertUserFromClerk } from "@/lib/auth/sync-user";
import { resolveDisplayName, resolvePrimaryEmail } from "@/lib/auth/clerk-user";

export async function currentUserId(): Promise<number> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Not authenticated");
  }

  const existing = await getDb().query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });
  if (existing) return existing.id;

  // The Clerk webhook may not have landed yet (e.g. right after sign-up) — sync now.
  const clerkUserRecord = await currentUser();
  if (!clerkUserRecord) throw new Error("Clerk user not found");

  const primaryEmail = resolvePrimaryEmail(
    clerkUserRecord.emailAddresses.map((address) => ({
      id: address.id,
      email_address: address.emailAddress,
    })),
    clerkUserRecord.primaryEmailAddressId,
  );
  if (!primaryEmail) throw new Error("Clerk user has no email address");

  const name = resolveDisplayName(clerkUserRecord.firstName, clerkUserRecord.lastName);

  const user = await upsertUserFromClerk({ clerkUserId, email: primaryEmail, name });
  return user.id;
}
