require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected:", db.databaseName);

  // ⚡ ১. সমস্ত ডামি ডাটা ডিলিট করা (টিম, ম্যাচ, ইনিংস, প্লেয়ার)
  for (const c of ["teams", "matches", "innings", "deliveries", "players"]) {
    await db.collection(c).deleteMany({});
  }

  // ⚡ ২. শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট তৈরি করা
  await db.collection("users").deleteMany({}); // পুরোনো ইউজার থাকলে ক্লিয়ার
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);
  await db.collection("users").insertOne({
    name: "Zihad Admin",
    email: "zihadbinsamsu2400@gmail.com",
    password: hashedPassword,
    role: "superadmin",
    createdAt: new Date(),
  });

  console.log("🧹 All dummy teams, players, and matches have been cleared!");
  console.log("👑 Admin Email: zihadbinsamsu2400@gmail.com | Password: admin123");
  await mongoose.disconnect();
}
run().catch((e) => { console.error("❌", e); process.exit(1); });
