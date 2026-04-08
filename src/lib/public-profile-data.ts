import { db } from "@/db";
import { matches, playerMatchStats, players, teams } from "@/db/schema";
import { asc, desc, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cache } from "react";

export type PublicTeamProfile = {
  team: {
    id: string;
    name: string;
    shortName: string;
    logoUrl: string | null;
    primaryColor: string | null;
    division: string;
  };
  roster: Array<{
    id: string;
    firstName: string;
    lastName: string;
    jerseyNumber: number | null;
    position: string | null;
  }>;
  record: {
    wins: number;
    losses: number;
    winPct: string;
    gamesPlayed: number;
  };
  recentMatches: Array<{
    id: string;
    matchDate: Date;
    status: string | null;
    homeScore: number | null;
    awayScore: number | null;
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeTeamName: string | null;
    awayTeamName: string | null;
    homeTeamColor: string | null;
    awayTeamColor: string | null;
    homeTeamShort: string | null;
    awayTeamShort: string | null;
  }>;
};

export type PublicPlayerProfile = {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    jerseyNumber: number | null;
    position: string | null;
    teamId: string | null;
    teamName: string | null;
    teamShortName: string | null;
    teamColor: string | null;
    division: string | null;
  };
  totals: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    gamesPlayed: number;
    ppg: number;
  };
  recentPerformances: Array<{
    matchId: string;
    matchDate: Date;
    status: string | null;
    homeScore: number | null;
    awayScore: number | null;
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeTeamName: string | null;
    awayTeamName: string | null;
    homeTeamColor: string | null;
    awayTeamColor: string | null;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    result: "W" | "L" | "T" | null;
    opponentName: string | null;
  }>;
};

const teamHomeAlias = alias(teams, "teamHome");
const teamAwayAlias = alias(teams, "teamAway");

function buildResult(homeScore: number | null, awayScore: number | null, isHomeTeam: boolean): "W" | "L" | "T" {
  const teamScore = isHomeTeam ? (homeScore ?? 0) : (awayScore ?? 0);
  const opponentScore = isHomeTeam ? (awayScore ?? 0) : (homeScore ?? 0);

  if (teamScore > opponentScore) return "W";
  if (teamScore < opponentScore) return "L";
  return "T";
}

function buildOpponentName(
  homeTeamId: string | null,
  awayTeamId: string | null,
  homeTeamName: string | null,
  awayTeamName: string | null,
  teamId: string | null
) {
  if (teamId && teamId === homeTeamId) return awayTeamName;
  if (teamId && teamId === awayTeamId) return homeTeamName;
  return null;
}

export const fetchPublicTeamProfile = cache(async (teamId: string): Promise<PublicTeamProfile | null> => {
  const [teamRows, rosterRows, completedMatches] = await Promise.all([
    db
      .select({
        id: teams.id,
        name: teams.name,
        shortName: teams.shortName,
        logoUrl: teams.logoUrl,
        primaryColor: teams.primaryColor,
        division: teams.division,
      })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1),
    db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        jerseyNumber: players.jerseyNumber,
        position: players.position,
      })
      .from(players)
      .where(eq(players.teamId, teamId)),
    db
      .select({
        id: matches.id,
        matchDate: matches.matchDate,
        status: matches.status,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        homeTeamName: teamHomeAlias.name,
        awayTeamName: teamAwayAlias.name,
        homeTeamColor: teamHomeAlias.primaryColor,
        awayTeamColor: teamAwayAlias.primaryColor,
        homeTeamShort: teamHomeAlias.shortName,
        awayTeamShort: teamAwayAlias.shortName,
      })
      .from(matches)
      .leftJoin(teamHomeAlias, eq(matches.homeTeamId, teamHomeAlias.id))
      .leftJoin(teamAwayAlias, eq(matches.awayTeamId, teamAwayAlias.id))
      .where(or(eq(matches.homeTeamId, teamId), eq(matches.awayTeamId, teamId)))
      .orderBy(desc(matches.matchDate)),
  ]);

  const team = teamRows[0];
  if (!team) return null;

  const sortedRoster = [...rosterRows].sort((a, b) => {
    const jerseyA = a.jerseyNumber ?? 999;
    const jerseyB = b.jerseyNumber ?? 999;
    if (jerseyA !== jerseyB) return jerseyA - jerseyB;
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  const completedOnly = completedMatches.filter(match => match.status === "COMPLETED");
  const record = completedOnly.reduce(
    (acc, match) => {
      const isHome = match.homeTeamId === teamId;
      const teamScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
      const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);

      if (teamScore > opponentScore) acc.wins += 1;
      else if (teamScore < opponentScore) acc.losses += 1;

      return acc;
    },
    { wins: 0, losses: 0 }
  );

  const gamesPlayed = record.wins + record.losses;
  const recentMatches = completedOnly.slice(0, 5);

  return {
    team,
    roster: sortedRoster,
    record: {
      ...record,
      gamesPlayed,
      winPct: gamesPlayed > 0 ? (record.wins / gamesPlayed).toFixed(3) : ".000",
    },
    recentMatches,
  };
});

export const fetchPublicPlayerProfile = cache(async (playerId: string): Promise<PublicPlayerProfile | null> => {
  const [playerRows, performanceRows] = await Promise.all([
    db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        jerseyNumber: players.jerseyNumber,
        position: players.position,
        teamId: players.teamId,
        teamName: teams.name,
        teamShortName: teams.shortName,
        teamColor: teams.primaryColor,
        division: teams.division,
      })
      .from(players)
      .leftJoin(teams, eq(players.teamId, teams.id))
      .where(eq(players.id, playerId))
      .limit(1),
    db
      .select({
        matchId: matches.id,
        matchDate: matches.matchDate,
        status: matches.status,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        homeTeamName: teamHomeAlias.name,
        awayTeamName: teamAwayAlias.name,
        homeTeamColor: teamHomeAlias.primaryColor,
        awayTeamColor: teamAwayAlias.primaryColor,
        points: playerMatchStats.points,
        offensiveRebounds: playerMatchStats.offensiveRebounds,
        defensiveRebounds: playerMatchStats.defensiveRebounds,
        assists: playerMatchStats.assists,
        steals: playerMatchStats.steals,
      })
      .from(playerMatchStats)
      .innerJoin(matches, eq(playerMatchStats.matchId, matches.id))
      .leftJoin(teamHomeAlias, eq(matches.homeTeamId, teamHomeAlias.id))
      .leftJoin(teamAwayAlias, eq(matches.awayTeamId, teamAwayAlias.id))
      .where(eq(playerMatchStats.playerId, playerId))
      .orderBy(desc(matches.matchDate)),
  ]);

  const player = playerRows[0];
  if (!player) return null;

  const totals = performanceRows.reduce(
    (acc, row) => {
      acc.points += Number(row.points ?? 0);
      acc.rebounds += Number(row.offensiveRebounds ?? 0) + Number(row.defensiveRebounds ?? 0);
      acc.assists += Number(row.assists ?? 0);
      acc.steals += Number(row.steals ?? 0);
      return acc;
    },
    { points: 0, rebounds: 0, assists: 0, steals: 0, gamesPlayed: 0 }
  );

  totals.gamesPlayed = performanceRows.length;
  const ppg = totals.gamesPlayed > 0 ? totals.points / totals.gamesPlayed : 0;

  const recentPerformances = performanceRows.slice(0, 5).map(row => {
    const teamId = player.teamId;
    const isHome = teamId ? row.homeTeamId === teamId : false;
    const result = teamId ? buildResult(row.homeScore, row.awayScore, isHome) : null;
    const opponentName = buildOpponentName(row.homeTeamId, row.awayTeamId, row.homeTeamName, row.awayTeamName, teamId);

    return {
      matchId: row.matchId,
      matchDate: row.matchDate,
      status: row.status,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      homeTeamId: row.homeTeamId,
      awayTeamId: row.awayTeamId,
      homeTeamName: row.homeTeamName,
      awayTeamName: row.awayTeamName,
      homeTeamColor: row.homeTeamColor,
      awayTeamColor: row.awayTeamColor,
      points: Number(row.points ?? 0),
      rebounds: Number(row.offensiveRebounds ?? 0) + Number(row.defensiveRebounds ?? 0),
      assists: Number(row.assists ?? 0),
      steals: Number(row.steals ?? 0),
      result,
      opponentName,
    };
  });

  return {
    player,
    totals: {
      ...totals,
      ppg,
    },
    recentPerformances,
  };
});
