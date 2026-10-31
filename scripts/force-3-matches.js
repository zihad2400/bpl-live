require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // ১. টিম চেক
  let teams = await db.collection("teams").find().toArray();
  if (teams.length < 2) {
    console.log("❌ Teams not found. Creating demo teams...");
    await db.collection("teams").insertMany([
      { name: "Dhaka Dynamites", shortName: "DD", primaryColor: "#10ff9f" },
      { name: "Comilla Victorians", shortName: "CV", primaryColor: "#7c3aed" }
    ]);
    teams = await db.collection("teams").find().toArray();
  }

  const teamA = teams[0]._id;
  const teamB = teams[1]._id;

  // ২. আগের ম্যাচ ক্লিয়ার করা (যাতে ডুপ্লিকেট না হয়)
  await db.collection("matches").deleteMany({});

  // ৩. ৩টি নতুন ম্যাচ তৈরি
  await db.collection("matches").insertMany([
    {
      teamA, teamB,
      venue: "Sher-e-Bangla Stadium", date: new Date(), status: "completed",
      matchNo: 1, overs: 20, result: `${teams[0].name} won by 15 runs`,
      createdAt: new Date(Date.now() - 86400000) // ১ দিন আগে
    },
    {
      teamA: teamB, teamB: teamA,
      venue: "Mirpur Stadium", date: new Date(), status: "completed",
      matchNo: 2, overs: 15, result: `${teams[1].name} won by 5 wickets`,
      createdAt: new Date(Date.now() - 43200000) // ১২ ঘণ্টা আগে
    },
    {
      teamA, teamB,
      venue: "Chattogram Stadium", date: new Date(), status: "upcoming",
      matchNo: 3, overs: 10, 
      createdAt: new Date()
    }
  ]);

  console.log("✅ 3 Matches created successfully! (2 Completed, 1 Upcoming)");
  await mongoose.disconnect();
}
run().catch((e) => { console.error("❌ Error:", e); process.exit(1); });
