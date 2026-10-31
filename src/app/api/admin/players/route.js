import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";
import Team from "@/models/Team";

export async function GET() {
  await connectDB();
  const players = await Player.find().populate("teamId", "name shortName").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ players });
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const player = await Player.create(body);
  return NextResponse.json({ player });
}
