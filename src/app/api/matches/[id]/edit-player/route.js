import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Innings from "@/models/Innings";

export async function POST(req, { params }) {
  const { id } = await params; // Next.js 16
  await connectDB();
  
  const { inningsId, role, oldName, newName } = await req.json();

  const innings = await Innings.findById(inningsId);
  if (!innings) return NextResponse.json({ error: "Innings not found" }, { status: 404 });

  if (role === "striker" || role === "nonStriker") {
    // ১. ব্যাটার অ্যারে আপডেট
    const batter = innings.batters.find(b => b.name === oldName);
    if (batter) batter.name = newName;
    
    // ২. টপ-লেভেল ফিল্ড আপডেট
    innings[role] = newName;
  } 
  else if (role === "bowler") {
    // ১. বোলার অ্যারে আপডেট
    const bowler = innings.bowlers.find(b => b.name === oldName);
    if (bowler) bowler.name = newName;
    
    // ২. টপ-লেভেল ফিল্ড আপডেট
    innings.bowler = newName;
  }

  await innings.save();
  return NextResponse.json({ success: true, innings });
}
