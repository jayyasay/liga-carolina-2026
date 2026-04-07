import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  unique
} from "drizzle-orm/pg-core";

// Enums
export const matchStatusEnum = pgEnum("match_status", [
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "CANCELED",
]);
export const playerPositionEnum = pgEnum("player_position", [
  "PG",
  "SG",
  "SF",
  "PF",
  "C",
]);
export const teamDivisionEnum = pgEnum("team_division", [
  "Kids Camp",
  "Midgets",
  "Juniors",
  "Seniors",
  "Open Seniors Division",
]);

// Teams Table
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 10 }).notNull(),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }),
  division: teamDivisionEnum("division").notNull().default("Open Seniors Division"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Players Table
export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  jerseyNumber: integer("jersey_number"),
  position: playerPositionEnum("position"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Matches Table
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeTeamId: uuid("home_team_id")
    .references(() => teams.id, { onDelete: "restrict" }),
  awayTeamId: uuid("away_team_id")
    .references(() => teams.id, { onDelete: "restrict" }),
  matchDate: timestamp("match_date", { withTimezone: true }).notNull(),
  venue: varchar("venue", { length: 255 }),
  status: matchStatusEnum("status").default("SCHEDULED"),
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  season: varchar("season", { length: 50 }),
  isPlayoff: boolean("is_playoff").default(false),
  playerOfTheGameId: uuid("player_of_the_game_id")
    // Reference without enforcing hard foreign key constraints inline to avoid circular dependencies easily
    // We will establish the DB relationship, but Drizzle relations can handle it logically if preferred
    .references(() => players.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Player Match Stats Table
export const playerMatchStats = pgTable(
  "player_match_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .references(() => matches.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .references(() => players.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" }),

    // Playing Time
    minutesPlayed: integer("minutes_played").default(0),

    // Scoring
    points: integer("points").default(0),
    fgMade: integer("fg_made").default(0),
    fgAttempted: integer("fg_attempted").default(0),
    threePtMade: integer("three_pt_made").default(0),
    threePtAttempted: integer("three_pt_attempted").default(0),
    ftMade: integer("ft_made").default(0),
    ftAttempted: integer("ft_attempted").default(0),

    // Rebounds
    offensiveRebounds: integer("offensive_rebounds").default(0),
    defensiveRebounds: integer("defensive_rebounds").default(0),

    // Playmaking & Defense
    assists: integer("assists").default(0),
    steals: integer("steals").default(0),
    blocks: integer("blocks").default(0),
    turnovers: integer("turnovers").default(0),
    personalFouls: integer("personal_fouls").default(0),

    // Advanced
    plusMinus: integer("plus_minus").default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique().on(t.matchId, t.playerId)]
);
