require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // ⚡ ১. টিম তৈরি (যদি আগে থেকে না থাকে)
  let teamA = await db.collection("teams").findOne({ shortName: "DD" });
  if (!teamA) {
    const resA = await db.collection("teams").insertOne({ name: "Dhaka Dynamites", shortName: "DD", primaryColor: "#10ff9f" });
    teamA = { _id: resA.insertedId };
  }

  let teamB = await db.collection("teams").findOne({ shortName: "CV" });
  if (!teamB) {
    const resB = await db.collection("teams").insertOne({ name: "Comilla Victorians", shortName: "CV", primaryColor: "#7c3aed" });
    teamB = { _id: resB.insertedId };
  }

  // ⚡ ২. ম্যাচ তৈরি
  const match = await db.collection("matches").insertOne({
    teamA: teamA._id, 
    teamB: teamB._id,
    venue: "Sher-e-Bangla Stadium",
    date: new Date(),
    status: "upcoming",
    matchNo: 1,
    overs: 20,
    createdAt: new Date()
  });

  console.log("✅ Demo Teams and Match Created Successfully!");
  console.log("👉 Match ID:", match.insertedId.toString());
  await mongoose.disconnect();
}
run().catch((e) => { console.error("❌ Error:", e); process.exit(1); });
