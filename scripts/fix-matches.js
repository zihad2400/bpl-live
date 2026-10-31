require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected to DB:", db.databaseName);

  // ১. টিম চেক
  let teams = await db.collection("teams").find().toArray();
  if (teams.length < 2) {
    console.log("⚠️ Teams missing. Creating teams...");
    await db.collection("teams").insertMany([
      { name: "Dhaka Dynamites", shortName: "DD", primaryColor: "#10ff9f" },
      { name: "Comilla Victorians", shortName: "CV", primaryColor: "#7c3aed" }
    ]);
    teams = await db.collection("teams").find().toArray();
  }
  const t1 = teams[0]._id;
  const t2 = teams[1]._id;

  // ২. আগের সব ম্যাচ ডিলিট
  console.log("🧹 Clearing old matches...");
  await db.collection("matches").deleteMany({});

  // ৩. ৩টি নতুন ম্যাচ তৈরি
  console.log("🌱 Inserting 3 matches...");
  const result = await db.collection("matches").insertMany([
    {
      teamA: t1, teamB: t2,
      venue: "Sher-e-Bangla Stadium", date: new Date(), status: "completed",
      matchNo: 1, overs: 20, result: `${teams[0].name} won by 15 runs`,
      manOfTheMatch: "Abu Jayed Riyad", topBatter: "Mahmudullah (48 runs)", topBowler: "Abu Jayed Riyad (6 wkts)"
    },
    {
      teamA: t2, teamB: t1,
      venue: "Mirpur Stadium", date: new Date(), status: "completed",
      matchNo: 2, overs: 15, result: `${teams[1].name} won by 5 wickets`,
      manOfTheMatch: "Litton Das", topBatter: "Litton Das (55 runs)", topBowler: "Mustafizur (3 wkts)"
    },
    {
      teamA: t1, teamB: t2,
      venue: "Chattogram Stadium", date: new Date(), status: "upcoming",
      matchNo: 3, overs: 10
    }
  ]);

  console.log(`✅ Successfully inserted ${result.insertedCount} matches!`);
  
  // ৪. ফাইনাল চেক
  const count = await db.collection("matches").countDocuments();
  console.log(`📊 Total matches in DB right now: ${count}`);
  
  await mongoose.disconnect();
}
run().catch(e => { console.error("❌ Error:", e); process.exit(1); });
