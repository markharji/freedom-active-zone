import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// Prevent model overwrite in dev
export default mongoose.models.User || mongoose.model("User", UserSchema);
