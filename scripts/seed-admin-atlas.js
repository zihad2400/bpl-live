require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI missing in .env.local");
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected to:", db.databaseName);

  // ⚡ ১. পুরোনো অ্যাডমিন থাকলে ডিলিট করা
  await db.collection("users").deleteMany({});

  // ⚡ ২. নতুন অ্যাডমিন তৈরি করা
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);
  
  await db.collection("users").insertOne({
    name: "Zihad Admin",
    email: "zihadbinsamsu2400@gmail.com",
    password: hashedPassword,
    role: "superadmin",
    createdAt: new Date(),
  });

  console.log("🎉 Admin created successfully in Atlas!");
  console.log("📧 Email: zihadbinsamsu2400@gmail.com");
  console.log("🔑 Password: admin123");
  
  await mongoose.disconnect();
}
run().catch((e) => { console.error("❌ Error:", e); process.exit(1); });
