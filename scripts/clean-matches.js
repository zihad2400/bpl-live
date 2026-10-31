require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // ⚡ সব ম্যাচ, ইনিংস ও ডেলিভারি ডিলিট করা হলো
  await db.collection("matches").deleteMany({});
  await db.collection("innings").deleteMany({});
  await db.collection("deliveries").deleteMany({});

  console.log("🧹 All matches, innings, and deliveries have been cleared!");
  console.log("✅ You can now create a fresh match from the Admin panel.");
  
  await mongoose.disconnect();
}

clean().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
