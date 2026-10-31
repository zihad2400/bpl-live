import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import Player from "@/models/Player";

export async function PUT(req, { params }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const team = await Team.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ team });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await connectDB();
  
  // ⚡ টিম ডিলিট করার আগে, এই টিমের সব প্লেয়ারকে Free Agent (teamId = null) করে দেওয়া হচ্ছে
  await Player.updateMany({ teamId: id }, { $set: { teamId: null } });
  
  // ⚡ অথবা যদি চান প্লেয়াররাও ডিলিট হয়ে যাক, তাহলে উপরের লাইনের বদলে এটি ব্যবহার করুন: 
  // await Player.deleteMany({ teamId: id });

  await Team.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
