import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const query = teamId ? { teamId } : {};
  const players = await Player.find(query).lean();
  return NextResponse.json({ players });
}
