import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Innings from "@/models/Innings";

export async function POST(req, { params }) {
  const { id } = await params;
  await connectDB();
  const { inningsId, role, newBatterName } = await req.json();

  const innings = await Innings.findById(inningsId);
  if (!innings) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ⚡ আউট হওয়া বা অলরেডি ব্যাট করা ব্যাটারকে ব্লক করা
  const existingBatter = innings.batters.find(b => b.name === newBatterName);
  if (existingBatter) {
    return NextResponse.json({ error: "This batter has already batted or is out." }, { status: 400 });
  }

  innings[role] = newBatterName;
  innings.batters.push({ name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0, out: false });

  await innings.save();
  return NextResponse.json({ success: true, innings });
}
