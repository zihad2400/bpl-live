import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.Newsletter || mongoose.model("Newsletter", schema);
