import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";
import Match from "@/models/Match";
import { applyDelivery } from "@/lib/cricket-engine";

export async function POST(req, { params }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const { inningsId, delivery } = body;

  const match = await Match.findById(id).populate("teamA teamB");
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  
  const innings = await Innings.findById(inningsId);
  if (!innings) return NextResponse.json({ error: "Innings not found" }, { status: 404 });

  if (!innings.bowler || innings.bowler === "null") {
    return NextResponse.json({ error: "Over complete! Please select a new bowler first." }, { status: 400 });
  }

  const strikerObj = innings.batters.find(b => b.name === innings.striker);
  const nonStrikerObj = innings.batters.find(b => b.name === innings.nonStriker);
  if (strikerObj?.out || nonStrikerObj?.out) {
    return NextResponse.json({ error: "A batter is out! Please select a new batter first." }, { status: 400 });
  }

  const maxBalls = (match.overs || 20) * 6;
  if (innings.totalLegalBalls >= maxBalls) return NextResponse.json({ error: "Innings Over!" }, { status: 400 });
  if (innings.wickets >= 10) return NextResponse.json({ error: "Innings Over!" }, { status: 400 });

  if (innings.inningsNumber === 2) {
    const inn1 = await Innings.findOne({ matchId: id, inningsNumber: 1 });
    if (inn1 && innings.totalRuns >= inn1.totalRuns + 1) {
      return NextResponse.json({ error: "Match Won! Target chased." }, { status: 400 });
    }
  }

  const before = innings.toObject();
  const next = applyDelivery(before, delivery);

  innings.totalRuns = next.totalRuns;
  innings.wickets = next.wickets;
  innings.totalLegalBalls = next.totalLegalBalls;
  innings.ballsThisOver = next.ballsThisOver;
  innings.extras = next.extras;
  innings.striker = next.striker;
  innings.nonStriker = next.nonStriker;
  innings.bowler = next.bowler;
  innings.batters = next.batters;
  innings.bowlers = next.bowlers;
  innings.fallOfWickets = next.fallOfWickets;
  await innings.save();

  const overNo = Math.floor(before.totalLegalBalls / 6) + 1;
  const deliveriesThisOver = await Delivery.countDocuments({ inningsId, overNumber: overNo });
  
  const saved = await Delivery.create({
    matchId: id, inningsId,
    overNumber: overNo, ballNumber: deliveriesThisOver + 1,
    striker: before.striker, nonStriker: before.nonStriker, bowler: before.bowler,
    ...delivery,
  });

  // ⚡ ম্যাচ শেষের সঠিক লজিক (শুধুমাত্র ২য় ইনিংস শেষ হলে)
  const isInningsOver = innings.totalLegalBalls >= maxBalls || innings.wickets >= 10;
  
  if (innings.inningsNumber === 2) {
    const inn1 = await Innings.findOne({ matchId: id, inningsNumber: 1 });
    const isTargetChased = inn1 && innings.totalRuns > inn1.totalRuns;
    
    // ২য় ইনিংস এবং (টার্গেট পূরণ অথবা ইনিংস শেষ) হলে ম্যাচ শেষ হবে
    if (isTargetChased || isInningsOver) {
      match.status = "completed";
      
      const teamAName = match.teamA?.name || "Team A";
      const teamBName = match.teamB?.name || "Team B";

      if (isTargetChased) {
        const wicketsLeft = 10 - innings.wickets;
        match.result = `${teamBName} won by ${wicketsLeft} wickets`;
      } else {
        if (inn1) {
          const margin = inn1.totalRuns - innings.totalRuns;
          match.result = `${teamAName} won by ${margin} runs`;
        } else {
          match.result = `${teamAName} won the match`;
        }
      }

      // MOTM & Stats logic
      const allInnings = await Innings.find({ matchId: id }).lean();
      let bestBatter = { name: "", runs: 0 };
      let bestBowler = { name: "", wickets: 0 };
      let motm = { name: "", impact: -1 };

      allInnings.forEach(inn => {
        inn.batters?.forEach(b => {
          if (b.runs > bestBatter.runs) bestBatter = { name: b.name, runs: b.runs };
          let impact = b.runs;
          if (impact > motm.impact) motm = { name: b.name, impact };
        });
        inn.bowlers?.forEach(bw => {
          if (bw.wickets > bestBowler.wickets) bestBowler = { name: bw.name, wickets: bw.wickets };
          let impact = (bw.wickets * 20) + (bw.runs ? (100 - bw.runs)/2 : 0);
          if (impact > motm.impact) motm = { name: bw.name, impact };
        });
      });

      match.manOfTheMatch = motm.name || "N/A";
      match.topBatter = `${bestBatter.name} (${bestBatter.runs} runs)`;
      match.topBowler = `${bestBowler.name} (${bestBowler.wickets} wkts)`;
      
      await match.save();
    }
  }

  return NextResponse.json({ delivery: saved, innings, match });
}
