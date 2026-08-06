export function matchesSearch(query: string, name: string, team: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q) || team.toLowerCase().includes(q);
}
