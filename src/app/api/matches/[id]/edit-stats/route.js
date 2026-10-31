import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";

export async function POST(req, { params }) {
  await connection();
  const { id } = await params;
  await connectDB();
  
  const { inningsId, totalRuns, totalWickets, totalBalls, matchOvers, newTarget } = await req.json();

  const match = await Match.findById(id);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const innings = await Innings.findById(inningsId);
  if (!innings) return NextResponse.json({ error: "Innings not found" }, { status: 404 });

  if (matchOvers) match.overs = Number(matchOvers);

  innings.totalRuns = Number(totalRuns);
  innings.wickets = Number(totalWickets);
  innings.totalLegalBalls = Number(totalBalls);
  innings.ballsThisOver = Number(totalBalls) % 6;

  if (innings.inningsNumber === 2 && newTarget) {
    innings.target = Number(newTarget);
  }

  innings.batters = innings.batters.map(b => ({ ...b, runs: 0, balls: 0, fours: 0, sixes: 0 }));
  innings.bowlers = innings.bowlers.map(b => ({ ...b, runs: 0, legalBalls: 0, wickets: 0, dots: 0 }));

  const currentOverNum = Math.floor(Number(totalBalls) / 6) + 1;
  await Delivery.deleteMany({ inningsId, overNumber: { $gte: currentOverNum } });

  await innings.save();

  // ⚡ এডিট করার পর ম্যাচের স্ট্যাটাস চেক করা
  const maxBalls = (match.overs || 20) * 6;
  const isInningsOver = innings.totalLegalBalls >= maxBalls || innings.wickets >= 10;

  if (innings.inningsNumber === 2) {
    const inn1 = await Innings.findOne({ matchId: id, inningsNumber: 1 });
    const isTargetChased = inn1 && innings.totalRuns >= inn1.totalRuns + 1;

    if (isTargetChased || isInningsOver) {
      match.status = "completed";
      // রেজাল্ট আপডেট
      if (isTargetChased) {
        match.result = `${match.teamB} won by ${10 - innings.wickets} wickets`;
      } else {
        match.result = `${match.teamA} won by ${inn1.totalRuns - innings.totalRuns} runs`;
      }
    } else {
      match.status = "live"; // টার্গেট শেষ না হলে আবার লাইভ হবে
    }
  } else {
    match.status = "live";
  }

  await match.save();

  return NextResponse.json({ success: true, innings, match });
}
