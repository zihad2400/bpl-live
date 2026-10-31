import mongoose from "mongoose";
const schema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
  matchNo: Number, venue: String, date: Date,
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  status: { type: String, enum: ["upcoming","live","completed","abandoned"], default: "upcoming" },
  currentInnings: { type: Number, default: 0 },
  tossWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  result: String, 
  overs: { type: Number, default: 20 }, // ⚡ Number টাইপ
  manOfTheMatch: String,
  topBatter: String,
  topBowler: String,
}, { timestamps: true });
export default mongoose.models.Match || mongoose.model("Match", schema);
