import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    // Check if already exists
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    await Newsletter.create({ email });
    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
