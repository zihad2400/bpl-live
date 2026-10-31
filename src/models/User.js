import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin","admin","scorer","viewer"], default: "viewer" },
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", schema);
