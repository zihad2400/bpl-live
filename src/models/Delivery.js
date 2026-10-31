import mongoose from "mongoose";
const schema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  inningsId: { type: mongoose.Schema.Types.ObjectId, ref: "Innings", required: true },
  overNumber: Number, ballNumber: Number,
  striker: String, nonStriker: String, bowler: String,
  runs: { type: Number, default: 0 },
  extraType: { type: String, enum: [null,"wide","noball","bye","legbye","penalty"], default: null },
  extraRuns: { type: Number, default: 0 },
  isWicket: { type: Boolean, default: false },
  wicketType: String, dismissedBatter: String, fielder: String,
  commentary: String,
}, { timestamps: true });
export default mongoose.models.Delivery || mongoose.model("Delivery", schema);
