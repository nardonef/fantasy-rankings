import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { draftSessions, players, users } from "@/lib/db/schema";

const CLERK_USER_ID = process.argv[2];

async function main() {
  if (!CLERK_USER_ID) {
    throw new Error(
      "Usage: dotenv -e .env.local -- tsx scripts/backfill-owner.ts <clerkUserId>\n" +
        "Sign in as the owner via Clerk first so their users row exists.",
    );
  }

  const db = getDb();

  const owner = await db.query.users.findFirst({
    where: eq(users.clerkUserId, CLERK_USER_ID),
  });
  if (!owner) {
    throw new Error(
      `No local user found for Clerk user ${CLERK_USER_ID}. Sign in as the owner first.`,
    );
  }

  console.log(`Attributing ownerless data to user #${owner.id} (${owner.email}) ...`);

  const backfilledPlayers = await db
    .update(players)
    .set({ userId: owner.id })
    .where(isNull(players.userId))
    .returning({ id: players.id });
  console.log(`players: attributed ${backfilledPlayers.length} row(s).`);

  const backfilledDrafts = await db
    .update(draftSessions)
    .set({ userId: owner.id })
    .where(isNull(draftSessions.userId))
    .returning({ id: draftSessions.id });
  console.log(`draft_sessions: attributed ${backfilledDrafts.length} row(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
