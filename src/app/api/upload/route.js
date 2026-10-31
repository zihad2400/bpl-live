import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ফাইলের বাইট ডেটা নেওয়া
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ইউনিক নাম তৈরি করা
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const dirPath = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(dirPath, filename);

    // ফোল্ডার না থাকলে তৈরি করা এবং ফাইল সেভ করা
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, buffer);

    // সফলভাবে আপলোড হলে URL রিটার্ন করা
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
