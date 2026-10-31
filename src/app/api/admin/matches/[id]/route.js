import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Match from "@/models/Match";

export async function PUT(req, { params }) {
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const match = await Match.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ match });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await connectDB();
  await Match.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
