import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: String, jerseyNumber: Number,
  role: { type: String, enum: ["batsman","bowler","allrounder","keeper"], default: "batsman" },
  battingStyle: String, bowlingStyle: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  stats: {
    matches: { type: Number, default: 0 }, runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }, fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 }, wickets: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 }, legalBallsBowled: { type: Number, default: 0 },
  },
}, { timestamps: true });
export default mongoose.models.Player || mongoose.model("Player", schema);
