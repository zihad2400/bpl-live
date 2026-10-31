import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";
import { formatOvers, runRate } from "@/lib/cricket-engine";

export async function GET(_req, { params }) {
  try {
    await connection(); // ⚡ এটি অটোমেটিকভাবেই ক্যাশ বন্ধ করে
    const { id } = await params;
    await connectDB();
    
    const match = await Match.findById(id)
      .populate("teamA", "name shortName logo primaryColor")
      .populate("teamB", "name shortName logo primaryColor")
      .lean();
      
    if (!match) return NextResponse.json({ error: "not found" }, { status: 404 });

    const innings = await Innings.find({ matchId: id }).sort({ inningsNumber: 1 }).lean();
    
    let currentOverDeliveries = [];
    const latestInnings = innings[innings.length - 1];
    
    if (latestInnings) {
      let currentOverNum = Math.floor(latestInnings.totalLegalBalls / 6) + 1;
      if (!latestInnings.bowler && latestInnings.totalLegalBalls > 0) {
         currentOverNum = Math.ceil(latestInnings.totalLegalBalls / 6);
      }
      currentOverDeliveries = await Delivery.find({ 
        matchId: id, 
        inningsId: latestInnings._id,
        overNumber: currentOverNum 
      }).sort({ createdAt: 1 }).lean();
    }

    const enriched = innings.map((i) => ({
      ...i,
      oversText: formatOvers(i.totalLegalBalls),
      runRate: runRate(i.totalRuns, i.totalLegalBalls),
      batters: (i.batters || []).map((b) => ({
        ...b,
        strikeRate: b.balls ? +((b.runs / b.balls) * 100).toFixed(2) : 0,
      })),
      bowlers: (i.bowlers || []).map((b) => ({
        ...b,
        overs: formatOvers(b.legalBalls),
        economy: b.legalBalls ? +(b.runs / (b.legalBalls / 6)).toFixed(2) : 0,
      })),
    }));

    return NextResponse.json({
      match,
      innings: enriched,
      currentOverDeliveries,
    });
  } catch (err) {
    console.error("GET /api/matches/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
