import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  profile: {
    name: String,
    email: String
  },
  preferences: {
    lowStock: Number,
    expiryDays: Number
  },
  
});

export default mongoose.model("Settings", settingsSchema);