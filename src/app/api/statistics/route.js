import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Innings from "@/models/Innings";

export async function GET() {
  try {
    await connection();
    await connectDB();

    const allInnings = await Innings.find().lean();
    
    const playerStats = {};

    // ⚡ সব ইনিংস ঘুরে প্রত্যেক প্লেয়ারের মোট স্ট্যাটস বের করা
    allInnings.forEach(inn => {
      // ব্যাটিং
      inn.batters?.forEach(b => {
        if (!b.name) return;
        if (!playerStats[b.name]) playerStats[b.name] = { name: b.name, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, runsConceded: 0, legalBallsBowled: 0 };
        
        playerStats[b.name].runs += b.runs || 0;
        playerStats[b.name].balls += b.balls || 0;
        playerStats[b.name].fours += b.fours || 0;
        playerStats[b.name].sixes += b.sixes || 0;
      });

      // বোলিং
      inn.bowlers?.forEach(bw => {
        if (!bw.name) return;
        if (!playerStats[bw.name]) playerStats[bw.name] = { name: bw.name, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, runsConceded: 0, legalBallsBowled: 0 };
        
        playerStats[bw.name].wickets += bw.wickets || 0;
        playerStats[bw.name].runsConceded += bw.runs || 0;
        playerStats[bw.name].legalBallsBowled += bw.legalBalls || 0;
      });
    });

    const statsArray = Object.values(playerStats);

    // ⚡ অরেঞ্জ ক্যাপ (সর্বোচ্চ রান) - টপ ৫
    const orangeCap = [...statsArray].sort((a, b) => b.runs - a.runs).slice(0, 5);

    // ⚡ পার্পল ক্যাপ (সর্বোচ্চ উইকেট) - টপ ৫
    const purpleCap = [...statsArray].sort((a, b) => b.wickets - a.wickets).slice(0, 5);

    // ⚡ সর্বোচ্চ স্ট্রাইক রেট (কমপক্ষে ১০ বল খেলা) - টপ ৫
    const bestStrikeRate = [...statsArray]
      .filter(p => p.balls >= 10)
      .map(p => ({ ...p, strikeRate: (p.runs / p.balls) * 100 }))
      .sort((a, b) => b.strikeRate - a.strikeRate)
      .slice(0, 5);

    // ⚡ সর্বোচ্চ সিক্স - টপ ৫
    const mostSixes = [...statsArray].sort((a, b) => b.sixes - a.sixes).slice(0, 5);

    return NextResponse.json({
      orangeCap,
      purpleCap,
      bestStrikeRate,
      mostSixes,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
