import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function upsertUserFromClerk(input: {
  clerkUserId: string;
  email: string;
  name: string | null;
}) {
  const [user] = await getDb()
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email: input.email, name: input.name, updatedAt: new Date() },
    })
    .returning();
  return user;
}
