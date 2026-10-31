import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Innings from "@/models/Innings";
import Match from "@/models/Match";
import Delivery from "@/models/Delivery";

export async function POST(req, { params }) {
  const { id } = await params;
  await connectDB();
  const { inningsId, bowler } = await req.json();
  
  const match = await Match.findById(id);
  const innings = await Innings.findById(inningsId);
  if (!innings || !match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ⚡ ১. ম্যাক্স ওভার লিমিট ক্যালকুলেশন
  const maxOvers = match.overs || 20;
  let maxBowlerOvers = 4;
  if (maxOvers === 20) maxBowlerOvers = 6;
  else if (maxOvers === 15) maxBowlerOvers = 4;
  else if (maxOvers === 10) maxBowlerOvers = 3;
  else maxBowlerOvers = Math.ceil(maxOvers / 5);

  // ⚡ ২. পরপর দুই ওভার চেক
  const lastDelivery = await Delivery.findOne({ inningsId }).sort({ createdAt: -1 });
  if (lastDelivery && lastDelivery.bowler === bowler) {
    return NextResponse.json({ error: "A bowler cannot bowl consecutive overs." }, { status: 400 });
  }

  // ⚡ ৩. ম্যাক্স ওভার চেক
  const bStat = innings.bowlers.find(b => b.name === bowler);
  if (bStat && (bStat.legalBalls / 6) >= maxBowlerOvers) {
    return NextResponse.json({ error: `Bowler has reached the limit of ${maxBowlerOvers} overs.` }, { status: 400 });
  }

  innings.bowler = bowler;
  const exists = innings.bowlers.find(b => b.name === bowler);
  if (!exists) {
    innings.bowlers.push({ name: bowler, runs: 0, legalBalls: 0, wickets: 0, dots: 0 });
  }
  
  await innings.save();
  return NextResponse.json({ innings });
}
