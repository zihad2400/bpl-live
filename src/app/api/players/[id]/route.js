import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Innings from "@/models/Innings";
import Match from "@/models/Match";

export async function GET(_req, { params }) {
  const { id } = await params;
  await connectDB();

  const player = await Player.findById(id).lean();
  if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  // ⚡ প্লেয়ারের সব ইনিংস খুঁজে বের করা (Dynamic Aggregation)
  const allInnings = await Innings.find({
    $or: [
      { "batters.name": player.name },
      { "bowlers.name": player.name }
    ]
  }).populate("matchId").lean();

  let totalRuns = 0, totalBalls = 0, totalFours = 0, totalSixes = 0, highestScore = 0, totalWickets = 0, totalRunsConceded = 0, totalBallsBowled = 0, matchesPlayed = new Set();

  allInnings.forEach(inn => {
    matchesPlayed.add(inn.matchId._id.toString());

    // ব্যাটিং স্ট্যাটস
    const batStat = inn.batters?.find(b => b.name === player.name);
    if (batStat) {
      totalRuns += batStat.runs;
      totalBalls += batStat.balls;
      totalFours += batStat.fours;
      totalSixes += batStat.sixes;
      if (batStat.runs > highestScore) highestScore = batStat.runs;
    }

    // বোলিং স্ট্যাটস
    const bowlStat = inn.bowlers?.find(b => b.name === player.name);
    if (bowlStat) {
      totalWickets += bowlStat.wickets;
      totalRunsConceded += bowlStat.runs;
      totalBallsBowled += bowlStat.legalBalls;
    }
  });

  const dynamicStats = {
    matches: matchesPlayed.size,
    runs: totalRuns,
    balls: totalBalls,
    fours: totalFours,
    sixes: totalSixes,
    highestScore,
    wickets: totalWickets,
    runsConceded: totalRunsConceded,
    ballsBowled: totalBallsBowled
  };

  // ম্যাচ লিস্ট
  const matchIds = Array.from(matchesPlayed);
  const recentMatches = await Match.find({ _id: { $in: matchIds } })
    .populate("teamA teamB", "name shortName")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return NextResponse.json({ player, stats: dynamicStats, recentMatches });
}
