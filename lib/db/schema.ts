import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const nflTeamEnum = pgEnum("nfl_team", [
  "ARI",
  "ATL",
  "BAL",
  "BUF",
  "CAR",
  "CHI",
  "CIN",
  "CLE",
  "DAL",
  "DEN",
  "DET",
  "GB",
  "HOU",
  "IND",
  "JAX",
  "KC",
  "LAC",
  "LAR",
  "LV",
  "MIA",
  "MIN",
  "NE",
  "NO",
  "NYG",
  "NYJ",
  "PHI",
  "PIT",
  "SEA",
  "SF",
  "TB",
  "TEN",
  "WAS",
]);

export const playerPositionEnum = pgEnum("player_position", [
  "QB",
  "RB",
  "WR",
  "TE",
]);

export const playerTierEnum = pgEnum("player_tier", ["green", "yellow", "red"]);

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique("seasons_year_unique").on(table.year),
]);

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  team: nflTeamEnum("team").notNull(),
  position: playerPositionEnum("position").notNull(),
  positionRank: integer("position_rank").notNull(),
  overallRank: integer("overall_rank").notNull(),
  tier: playerTierEnum("tier"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("players_season_position_idx").on(table.seasonId, table.position),
  index("players_season_idx").on(table.seasonId),
]);
