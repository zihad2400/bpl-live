import mongoose from "mongoose";
const batterSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: String, runs: { type: Number, default: 0 }, balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 }, sixes: { type: Number, default: 0 },
  dismissal: String, out: { type: Boolean, default: false },
}, { _id: false });

const bowlerSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  name: String, runs: { type: Number, default: 0 }, legalBalls: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 }, dots: { type: Number, default: 0 },
}, { _id: false });

const schema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  inningsNumber: { type: Number, required: true },
  battingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  bowlingTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  totalRuns: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  totalLegalBalls: { type: Number, default: 0 },
  ballsThisOver: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  striker: String, nonStriker: String, bowler: String,
  batters: [batterSchema], bowlers: [bowlerSchema],
  fallOfWickets: [{ score: Number, wicket: Number, batter: String }],
  status: { type: String, enum: ["in-progress","completed"], default: "in-progress" },
  target: Number,
}, { timestamps: true });
schema.index({ matchId: 1, inningsNumber: 1 }, { unique: true });
export default mongoose.models.Innings || mongoose.model("Innings", schema);
