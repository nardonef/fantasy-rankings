export function resolvePrimaryEmail(
  addresses: { id: string; email_address: string }[],
  primaryId: string | null,
): string | undefined {
  return addresses.find((address) => address.id === primaryId)?.email_address
    ?? addresses[0]?.email_address;
}

export function resolveDisplayName(
  firstName: string | null,
  lastName: string | null,
): string | null {
  return [firstName, lastName].filter(Boolean).join(" ") || null;
}
