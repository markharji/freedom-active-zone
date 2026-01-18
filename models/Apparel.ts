import mongoose from "mongoose";

const ApparelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sport: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    rating: { type: Number, default: 0 },
    images: [{ type: String }],
  },
  { timestamps: true },
);

// Prevent model overwrite in dev
export default mongoose.models.Apparel || mongoose.model("Apparel", ApparelSchema);
