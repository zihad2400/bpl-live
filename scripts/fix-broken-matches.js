require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected to DB");

  // ১. সব পুরোনো ম্যাচ ডিলিট করা (যেহেতু টিমের আইডি বদলে গেছে)
  await db.collection("matches").deleteMany({});
  await db.collection("innings").deleteMany({});
  await db.collection("deliveries").deleteMany({});
  console.log("🧹 Cleared broken matches.");

  // ২. নতুন টিম খুঁজে বের করা
  const teams = await db.collection("teams").find().limit(2).toArray();
  if (teams.length < 2) {
    console.log("❌ Teams missing! Please create teams first.");
    process.exit(1);
  }

  const t1 = teams[0];
  const t2 = teams[1];

  // ৩. নতুন সঠিক ম্যাচ তৈরি করা
  await db.collection("matches").insertMany([
    {
      teamA: t1._id, teamB: t2._id,
      venue: "Sher-e-Bangla Stadium", date: new Date(), status: "completed",
      matchNo: 1, overs: 20, result: `${t1.name} won by 15 runs`,
      manOfTheMatch: "Abu Jayed Riyad", topBatter: "Mahmudullah (48 runs)", topBowler: "Abu Jayed Riyad (6 wkts)"
    },
    {
      teamA: t2._id, teamB: t1._id,
      venue: "Mirpur Stadium", date: new Date(), status: "live",
      matchNo: 2, overs: 15
    },
    {
      teamA: t1._id, teamB: t2._id,
      venue: "Chattogram Stadium", date: new Date(), status: "upcoming",
      matchNo: 3, overs: 10
    }
  ]);

  console.log("✅ Created 3 new valid matches!");
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
