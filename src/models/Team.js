import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: String,
  logo: String,
  primaryColor: { type: String, default: "#10ff9f" },
  secondaryColor: { type: String, default: "#0a0e27" },
  owner: String, coach: String, captain: String,
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
}, { timestamps: true });
export default mongoose.models.Team || mongoose.model("Team", schema);
