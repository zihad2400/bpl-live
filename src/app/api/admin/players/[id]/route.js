import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Player from "@/models/Player";

export async function PUT(req, { params }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const player = await Player.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ player });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await connectDB();
  await Player.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
