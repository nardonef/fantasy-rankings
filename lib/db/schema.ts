import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  boolean,
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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("users_clerk_user_id_unique").on(table.clerkUserId),
]);

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  positionRankLinked: boolean("position_rank_linked").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique("seasons_year_unique").on(table.year),
]);

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  // Nullable until the pre-multi-user backfill runs; make NOT NULL in a follow-up migration once every row is owned.
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sleeperId: text("sleeper_id").references(() => playerCatalog.sleeperId, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 100 }).notNull(),
  team: nflTeamEnum("team").notNull(),
  position: playerPositionEnum("position").notNull(),
  positionRank: integer("position_rank").notNull(),
  overallRank: integer("overall_rank").notNull(),
  tier: playerTierEnum("tier"),
  notes: text("notes"),
  positionTierBreak: boolean("position_tier_break").notNull().default(false),
  overallTierBreak: boolean("overall_tier_break").notNull().default(false),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("players_season_position_idx").on(table.seasonId, table.position),
  index("players_season_idx").on(table.seasonId),
  index("players_season_user_idx").on(table.seasonId, table.userId),
]);

export const draftSessions = pgTable("draft_sessions", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  // Nullable until the pre-multi-user backfill runs; make NOT NULL in a follow-up migration once every row is owned.
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
}, (table) => [
  unique("draft_sessions_season_user_unique").on(table.seasonId, table.userId),
]);

export const draftedPlayers = pgTable("drafted_players", {
  id: serial("id").primaryKey(),
  draftSessionId: integer("draft_session_id")
    .notNull()
    .references(() => draftSessions.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  position: playerPositionEnum("position").notNull(),
  overallRank: integer("overall_rank").notNull(),
  positionRank: integer("position_rank").notNull(),
  draftedAt: timestamp("drafted_at"),
}, (table) => [
  unique("drafted_players_session_player_unique").on(table.draftSessionId, table.playerId),
  index("drafted_players_session_idx").on(table.draftSessionId),
]);

// Marks that a user has passed through the starting-rankings picker for a season,
// even if they chose to start blank (which otherwise leaves no players rows to detect).
export const seasonStarts = pgTable("season_starts", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique("season_starts_season_user_unique").on(table.seasonId, table.userId),
]);

export const playerCatalog = pgTable("player_catalog", {
  sleeperId: text("sleeper_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  team: varchar("team", { length: 10 }),
  position: playerPositionEnum("position").notNull(),
  photoUrl: text("photo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
