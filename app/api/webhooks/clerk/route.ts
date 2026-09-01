import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { upsertUserFromClerk } from "@/lib/auth/sync-user";
import { resolveDisplayName, resolvePrimaryEmail } from "@/lib/auth/clerk-user";

type ClerkUserEventData = {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserEventData;
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();

  let event: ClerkWebhookEvent;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as unknown as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data;
    const primaryEmail = resolvePrimaryEmail(email_addresses, primary_email_address_id);

    if (!primaryEmail) {
      return NextResponse.json({ error: "User has no email address" }, { status: 400 });
    }

    const name = resolveDisplayName(first_name, last_name);

    await upsertUserFromClerk({ clerkUserId: id, email: primaryEmail, name });
  }

  return NextResponse.json({ received: true });
}
