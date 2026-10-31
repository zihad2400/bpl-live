require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("Connected to MongoDB...");

  // ১. সব ডাটা ক্লিয়ার করা
  await db.collection("teams").deleteMany({});
  await db.collection("players").deleteMany({});
  await db.collection("matches").deleteMany({});
  await db.collection("innings").deleteMany({});
  await db.collection("deliveries").deleteMany({});
  console.log("🧹 Cleared all old data.");

  // ২. নতুন টিম তৈরি
  const t1 = await db.collection("teams").insertOne({ name: "Dhaka Dynamites", shortName: "DD", primaryColor: "#10ff9f", secondaryColor: "#064e3b" });
  const t2 = await db.collection("teams").insertOne({ name: "Comilla Victorians", shortName: "CV", primaryColor: "#7c3aed", secondaryColor: "#0a0e27" });
  console.log("✅ Created 2 Teams.");

  // ৩. নতুন ম্যাচ তৈরি
  await db.collection("matches").insertMany([
    {
      teamA: t1.insertedId, teamB: t2.insertedId,
      venue: "Sher-e-Bangla Stadium", date: new Date(), status: "completed",
      matchNo: 1, overs: 20, result: "Dhaka Dynamites won by 15 runs",
      manOfTheMatch: "Abu Jayed Riyad", topBatter: "Mahmudullah (48 runs)", topBowler: "Abu Jayed Riyad (6 wkts)"
    },
    {
      teamA: t2.insertedId, teamB: t1.insertedId,
      venue: "Mirpur Stadium", date: new Date(), status: "live",
      matchNo: 2, overs: 15
    },
    {
      teamA: t1.insertedId, teamB: t2.insertedId,
      venue: "Chattogram Stadium", date: new Date(), status: "upcoming",
      matchNo: 3, overs: 10
    }
  ]);
  console.log("✅ Created 3 Matches (1 Completed, 1 Live, 1 Upcoming).");
  
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
