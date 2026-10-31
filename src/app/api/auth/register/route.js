import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export async function POST(req) {
  await connectDB();
  const { name, email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword, role: "viewer" });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const res = NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 604800, path: "/" });
  return res;
}
