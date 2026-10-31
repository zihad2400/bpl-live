import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: String, season: String, format: { type: String, default: "T20" },
  organizer: String, status: { type: String, enum: ["upcoming","live","completed"], default: "upcoming" },
}, { timestamps: true });
export default mongoose.models.Tournament || mongoose.model("Tournament", schema);
