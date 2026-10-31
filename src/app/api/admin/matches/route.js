import { NextResponse } from "next/server";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET() {
  try {
    await connection();
    await connectDB();
    const matches = await Match.find()
      .populate("teamA", "name shortName")
      .populate("teamB", "name shortName")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ matches });
  } catch (err) {
    console.error("GET matches error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (!body.teamA || !body.teamB) {
      return NextResponse.json({ error: "Both Team A and Team B are required." }, { status: 400 });
    }

    const match = await Match.create(body);
    return NextResponse.json({ match });
  } catch (err) {
    console.error("POST match error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
