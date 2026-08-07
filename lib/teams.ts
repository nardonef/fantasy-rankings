import { nflTeamEnum } from "@/lib/db/schema";

export type NflTeam = (typeof nflTeamEnum.enumValues)[number];

const TEAM_SET = new Set<string>(nflTeamEnum.enumValues);

export function normalizeTeam(team: string | null | undefined): NflTeam | null {
  if (!team) return null;
  const upper = team.toUpperCase();
  return TEAM_SET.has(upper) ? (upper as NflTeam) : null;
}
