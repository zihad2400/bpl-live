import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team"; // ⚡ REQUIRED for populate()
import Player from "@/models/Player"; // ensure it's registered

export async function GET() {
  try {
    await connectDB();
    const matches = await Match.find()
      .populate("teamA", "name shortName primaryColor logo")
      .populate("teamB", "name shortName primaryColor logo")
      .sort({ date: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ matches });
  } catch (err) {
    console.error("GET /api/matches error:", err);
    return NextResponse.json({ error: err.message, matches: [] }, { status: 500 });
  }
}
