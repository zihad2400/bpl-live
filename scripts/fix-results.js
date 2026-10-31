require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function fixResults() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected to MongoDB");

  // ⚡ সব completed ম্যাচ খুঁজে বের করা
  const matches = await db.collection("matches").find({ status: "completed" }).toArray();

  let fixedCount = 0;

  for (const match of matches) {
    const teamA = await db.collection("teams").findOne({ _id: match.teamA });
    const teamB = await db.collection("teams").findOne({ _id: match.teamB });
    const innings = await db.collection("innings").find({ matchId: match._id }).sort({ inningsNumber: 1 }).toArray();

    if (innings.length === 2 && teamA && teamB) {
      const inn1 = innings[0];
      const inn2 = innings[1];

      let resultStr = "";
      
      // ⚡ সঠিক রেজাল্ট ক্যালকুলেশন
      if (inn2.totalRuns > inn1.totalRuns) {
        const wicketsLeft = 10 - inn2.wickets;
        resultStr = `${teamB.name} won by ${wicketsLeft} wickets`;
      } else if (inn1.totalRuns > inn2.totalRuns) {
        const margin = inn1.totalRuns - inn2.totalRuns;
        resultStr = `${teamA.name} won by ${margin} runs`;
      } else {
        resultStr = "Match Tied";
      }

      // ⚡ ডাটাবেসে সঠিক নাম সেভ করা
      await db.collection("matches").updateOne(
        { _id: match._id },
        { $set: { result: resultStr } }
      );
      console.log(`✔️ Fixed Match ${match._id}: ${resultStr}`);
      fixedCount++;
    }
  }

  console.log(`🎉 Successfully fixed ${fixedCount} matches!`);
  await mongoose.disconnect();
}

fixResults().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
