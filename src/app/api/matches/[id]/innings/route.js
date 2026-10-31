import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";

export async function POST(req, { params }) {
  const { id } = await params;
  await connectDB();
  
  const match = await Match.findById(id);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const body = await req.json();
  const { striker, nonStriker, bowler } = body;

  if (!striker || !nonStriker || !bowler) {
    return NextResponse.json({ error: "striker, nonStriker, bowler required" }, { status: 400 });
  }

  const count = await Innings.countDocuments({ matchId: id });
  if (count >= 2) return NextResponse.json({ error: "Both innings already created" }, { status: 400 });

  let target = null;
  let battingTeam, bowlingTeam;

  if (count === 0) {
    // ⚡ ১ম ইনিংস: Team A ব্যাট করবে
    battingTeam = match.teamA;
    bowlingTeam = match.teamB;
  } else {
    // ⚡ ২য় ইনিংস: Team B ব্যাট করবে
    battingTeam = match.teamB;
    bowlingTeam = match.teamA;
    
    const firstInnings = await Innings.findOne({ matchId: id, inningsNumber: 1 });
    if (firstInnings) {
      target = firstInnings.totalRuns + 1;
    }
  }

  const innings = await Innings.create({
    matchId: id,
    inningsNumber: count + 1,
    battingTeam: battingTeam,
    bowlingTeam: bowlingTeam,
    striker,
    nonStriker,
    bowler,
    target,
    batters: [
      { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
      { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, out: false },
    ],
    bowlers: [{ name: bowler, runs: 0, legalBalls: 0, wickets: 0, dots: 0 }],
  });
  
  match.status = "live";
  match.currentInnings = count + 1;
  await match.save();
  
  return NextResponse.json({ innings });
}
