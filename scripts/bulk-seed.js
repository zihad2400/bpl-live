require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ডামি ডাটা জেনারেট করার হেল্পার ফাংশন
const FIRST_NAMES = ["Shakib", "Tamim", "Mushfiq", "Mahmudullah", "Riyad", "Mustafizur", "Mehedi", "Liton", "Sabbir", "Taskin", "Soumya", "Imrul", "Rubel", "Shafiul", "Afif", "Towhid", "Nurul", "Jaker", "Shoriful", "Nasum", "Parvez", "Anamul", "Ariful", "Mosaddek", "Rony", "Ziaur", "Al-Amin", "Abu Jayed", "Ebadot", "Shahadat"];
const LAST_NAMES = ["Al Hasan", "Iqbal", "Rahim", "Riyad", "Hossain", "Rahman", "Miraz", "Das", "Rahman", "Ahmed", "Sarkar", "Kayes", "Hossain", "Islam", "Hossain", "Hridoy", "Hasan", "Ali", "Islam", "Hossain", "Emon", "Bijoy", "Chowdhury", "Hossain", "Talukdar", "Rahman", "Hossain", "Javed", "Hossain", "Hossain"];

const TEAM_NAMES = [
  { name: "Dhaka Dominators", short: "DD", color: "#10ff9f" },
  { name: "Comilla Victorians", short: "CV", color: "#7c3aed" },
  { name: "Khulna Tigers", short: "KT", color: "#fbbf24" },
  { name: "Rangpur Riders", short: "RR", color: "#e11d48" },
  { name: "Sylhet Strikers", short: "SS", color: "#00d4ff" },
  { name: "Chattogram Challengers", short: "CC", color: "#f97316" },
  { name: "Fortune Barishal", short: "FB", color: "#ec4899" },
  { name: "Minister Group Rajshahi", short: "MGR", color: "#8b5cf6" },
  { name: "Cumilla Warriors", short: "CW", color: "#ef4444" },
  { name: "Dhaka Dynamites", short: "DYN", color: "#3b82f6" },
];

const ROLES = ["batsman", "batsman", "batsman", "batsman", "batsman", "bowler", "bowler", "bowler", "bowler", "bowler", "allrounder", "allrounder", "allrounder", "keeper", "keeper"];
const BATTING_STYLES = ["Right-hand bat", "Left-hand bat"];
const BOWLING_STYLES = ["Right-arm fast", "Right-arm medium", "Right-arm offbreak", "Right-arm legbreak", "Left-arm fast", "Left-arm medium", "Left-arm orthodox", "Left-arm wrist-spin", "None"];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log("✅ Connected:", db.databaseName);

  // ১. সব ডাটা ক্লিয়ার করা
  for (const c of ["teams", "matches", "innings", "deliveries", "players"]) {
    await db.collection(c).deleteMany({});
  }

  // ২. অ্যাডমিন ইউজার নিশ্চিত করা
  await db.collection("users").deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);
  await db.collection("users").insertOne({
    name: "Zihad Admin",
    email: "zihadbinsamsu2400@gmail.com",
    password: hashedPassword,
    role: "superadmin",
    createdAt: new Date(),
  });

  console.log("🧹 Database cleared. Generating 10 Teams & 150 Players...");

  // ৩. টিম এবং প্লেয়ার জেনারেট করা
  for (let i = 0; i < TEAM_NAMES.length; i++) {
    const t = TEAM_NAMES[i];
    
    // টিম তৈরি
    const teamRes = await db.collection("teams").insertOne({
      name: t.name,
      shortName: t.short,
      primaryColor: t.color,
      createdAt: new Date(),
    });
    const teamId = teamRes.insertedId;

    // ১৫ জন প্লেয়ার তৈরি
    const players = [];
    for (let j = 0; j < 15; j++) {
      const role = ROLES[j];
      const isBowler = role === "bowler" || role === "allrounder";
      const isBatter = role === "batsman" || role === "allrounder" || role === "keeper";
      
      const firstName = getRandom(FIRST_NAMES);
      const lastName = getRandom(LAST_NAMES);
      
      players.push({
        name: `${firstName} ${lastName}`,
        role: role,
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        battingStyle: isBatter ? getRandom(BATTING_STYLES) : "N/A",
        bowlingStyle: isBowler ? getRandom(BOWLING_STYLES) : "None",
        teamId: teamId,
        photo: "", // ডিফল্ট অ্যাভাটার ব্যবহার হবে
        stats: {
          matches: Math.floor(Math.random() * 50),
          runs: isBatter ? Math.floor(Math.random() * 1500) : Math.floor(Math.random() * 100),
          balls: isBatter ? Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 100),
          fours: isBatter ? Math.floor(Math.random() * 100) : 0,
          sixes: isBatter ? Math.floor(Math.random() * 50) : 0,
          wickets: isBowler ? Math.floor(Math.random() * 80) : 0,
          runsConceded: isBowler ? Math.floor(Math.random() * 1000) : 0,
          legalBallsBowled: isBowler ? Math.floor(Math.random() * 800) : 0,
        },
        createdAt: new Date(),
      });
    }
    
    await db.collection("players").insertMany(players);
    console.log(`   ✔️ Created Team: ${t.name} with 15 players.`);
  }

  console.log("🎉 SUCCESS! 10 Teams and 150 Players have been added to the database.");
  console.log("👑 Admin Email: zihadbinsamsu2400@gmail.com | Password: admin123");
  await mongoose.disconnect();
}

run().catch((e) => { console.error("❌", e); process.exit(1); });
