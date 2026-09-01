import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

let counter = 0;

export async function createTestUser(emailPrefix = "test-user") {
  const unique = `${Date.now()}-${counter++}`;
  const [user] = await getDb()
    .insert(users)
    .values({ clerkUserId: `clerk-${unique}`, email: `${emailPrefix}-${unique}@example.com` })
    .returning();
  return user;
}
